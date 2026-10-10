import os
import re
import json
from urllib.parse import urljoin, quote, unquote
from flask import Flask, render_template, request, jsonify, Response, stream_with_context
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

app = Flask(__name__, static_folder='static', template_folder='templates')

# High-Performance Session with TCP Keep-Alive Connection Pooling
proxy_session = requests.Session()
retries = Retry(total=2, backoff_factor=0.2, status_forcelist=[500, 502, 503, 504])
adapter = HTTPAdapter(pool_connections=100, pool_maxsize=200, max_retries=retries)
proxy_session.mount('http://', adapter)
proxy_session.mount('https://', adapter)

# Load channels
CHANNELS_FILE = os.path.join(os.path.dirname(__file__), 'channels.json')
CHANNELS = []

def generate_default_servers(c):
    """Ensure every channel has at least 4 fallback server endpoints."""
    url = c.get('stream_url', '')
    backups = c.get('backup_urls', [])
    servers = [
        {
            'id': 'srv_1',
            'name': 'Server 1 (High-Speed Direct)',
            'badge': '⚡ Direct CDN',
            'url': url,
            'type': 'direct',
            'description': 'Direct origin streaming with lowest latency'
        },
        {
            'id': 'srv_2',
            'name': 'Server 2 (Turbo Buffer-Free Proxy)',
            'badge': '🚀 Turbo Buffer-Free',
            'url': f"/api/proxy?server=turbo&url={quote(url)}",
            'type': 'proxy',
            'description': 'Persistent Keep-Alive connection pool with 128KB prebuffering'
        },
        {
            'id': 'srv_3',
            'name': 'Server 3 (Edge Bypass Route)',
            'badge': '🛡️ Edge Bypass',
            'url': f"/api/proxy?server=edge&url={quote(url)}",
            'type': 'proxy',
            'description': 'AppleCoreMedia headers to bypass geo-restrictions & CORS locks'
        }
    ]

    if backups and len(backups) > 0:
        servers.append({
            'id': 'srv_4',
            'name': 'Server 4 (Alternative Broadcast Feed)',
            'badge': '📡 Alt Source',
            'url': backups[0],
            'type': 'direct',
            'description': 'Secondary broadcast transmission line'
        })
        servers.append({
            'id': 'srv_5',
            'name': 'Server 5 (Backup Cloud Proxy)',
            'badge': '🌐 Cloud Mirror',
            'url': f"/api/proxy?server=backup&url={quote(backups[0])}",
            'type': 'proxy',
            'description': 'Proxied secondary broadcast source'
        })
    else:
        servers.append({
            'id': 'srv_4',
            'name': 'Server 4 (Backup Cloud Proxy)',
            'badge': '🌐 Cloud Mirror',
            'url': f"/api/proxy?server=backup&url={quote(url)}",
            'type': 'proxy',
            'description': 'Failover cloud-routed proxy'
        })

    return servers

def load_channels():
    global CHANNELS
    if os.path.exists(CHANNELS_FILE):
        try:
            with open(CHANNELS_FILE, 'r', encoding='utf-8') as f:
                raw_channels = json.load(f)
            # Ensure all channels have servers array
            for ch in raw_channels:
                if 'servers' not in ch or not ch['servers']:
                    ch['servers'] = generate_default_servers(ch)
            CHANNELS = raw_channels
            print(f"Loaded {len(CHANNELS)} channels into memory.")
        except Exception as e:
            print(f"Error loading channels: {e}")
            CHANNELS = []
    else:
        CHANNELS = []

load_channels()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/channels')
def get_channels():
    country = request.args.get('country', '').lower().strip()
    category = request.args.get('category', '').lower().strip()
    search = request.args.get('search', '').lower().strip()
    lang = request.args.get('language', '').lower().strip()
    featured = request.args.get('featured', '').lower()

    filtered = CHANNELS

    if country and country != 'all':
        filtered = [c for c in filtered if c.get('country_code', '').lower() == country]

    if category and category != 'all' and category != 'all channels':
        filtered = [c for c in filtered if c.get('category', '').lower() == category]

    if lang and lang != 'all':
        filtered = [c for c in filtered if c.get('language', '').lower() == lang]

    if featured == 'true':
        filtered = [c for c in filtered if c.get('featured') is True]

    if search:
        filtered = [
            c for c in filtered
            if search in c.get('name', '').lower()
            or search in c.get('country', '').lower()
            or search in c.get('category', '').lower()
            or search in c.get('group', '').lower()
        ]

    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', default=0, type=int)

    total = len(filtered)
    if limit:
        result_items = filtered[offset:offset+limit]
    else:
        result_items = filtered

    return jsonify({
        'total': total,
        'offset': offset,
        'limit': limit or total,
        'channels': result_items
    })

@app.route('/api/stats')
def get_stats():
    categories = {'all': len(CHANNELS), 'sports': 0, 'news': 0, 'religious': 0, 'entertainment': 0, 'others': 0}
    countries = {'bd': 0, 'in': 0, 'pk': 0, 'all': len(CHANNELS)}

    for c in CHANNELS:
        cat = c.get('category', 'others').lower()
        if cat in categories:
            categories[cat] += 1
        else:
            categories['others'] += 1

        cc = c.get('country_code', '').lower()
        if cc in countries:
            countries[cc] += 1

    return jsonify({
        'categories': categories,
        'countries': countries,
        'total': len(CHANNELS)
    })

@app.route('/api/channel/<channel_id>')
def get_channel(channel_id):
    for c in CHANNELS:
        if c.get('id') == channel_id:
            if 'servers' not in c or not c['servers']:
                c['servers'] = generate_default_servers(c)
            return jsonify(c)
    return jsonify({'error': 'Channel not found'}), 404

@app.route('/api/proxy')
def stream_proxy():
    """
    High-Performance Multi-Server Stream and Manifest Proxy.
    Injects permissive CORS headers, rewrites relative M3U8 chunk/key URLs,
    maintains persistent TCP Keep-Alive connection pools, and supports
    custom server profiles:
      - 'turbo': 128KB chunk buffers, Keep-Alive connection pool
      - 'edge': AppleCoreMedia/ExoPlayer spoofed headers
      - 'backup': LibVLC headers
      - 'direct': Chrome desktop emulation
    """
    raw_url = request.args.get('url', '')
    if not raw_url:
        return "Missing url parameter", 400

    server_mode = request.args.get('server', 'turbo').lower()
    target_url = unquote(raw_url)

    # Server profile headers
    if server_mode == 'edge':
        req_headers = {
            'User-Agent': 'AppleCoreMedia/1.0.0.19E241 (iPad; U; CPU OS 15_4 like Mac OS X; en_us)',
            'Accept': '*/*',
            'Referer': target_url,
            'Origin': 'https://www.apple.com'
        }
    elif server_mode == 'backup':
        req_headers = {
            'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
            'Accept': '*/*',
            'Connection': 'keep-alive'
        }
    else:  # turbo / default
        req_headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Referer': target_url
        }

    # Range request passthrough for audio/video seeking
    if 'Range' in request.headers:
        req_headers['Range'] = request.headers['Range']

    try:
        upstream = proxy_session.get(target_url, headers=req_headers, stream=True, timeout=10)
        content_type = upstream.headers.get('Content-Type', '')

        # Check if this is an HLS playlist (.m3u8)
        is_m3u8 = (
            '.m3u8' in target_url.lower() or 
            'application/vnd.apple.mpegurl' in content_type.lower() or
            'application/x-mpegurl' in content_type.lower() or
            'audio/mpegurl' in content_type.lower()
        )

        if is_m3u8:
            body_text = upstream.content.decode('utf-8', errors='ignore')
            lines = body_text.splitlines()
            rewritten_lines = []

            for line in lines:
                stripped = line.strip()
                if not stripped:
                    rewritten_lines.append(line)
                elif stripped.startswith('#'):
                    # Handle URI attributes inside tags like #EXT-X-KEY:METHOD=...,URI="..."
                    if 'URI="' in stripped:
                        def replace_uri(match):
                            nested_uri = match.group(1)
                            full_nested = urljoin(target_url, nested_uri)
                            return f'URI="/api/proxy?server={server_mode}&url={quote(full_nested)}"'
                        stripped = re.sub(r'URI="([^"]+)"', replace_uri, stripped)
                    rewritten_lines.append(stripped)
                else:
                    # Line is a child stream/chunk URL
                    abs_chunk_url = urljoin(target_url, stripped)
                    rewritten_lines.append(f"/api/proxy?server={server_mode}&url={quote(abs_chunk_url)}")

            output_content = '\n'.join(rewritten_lines)
            resp = Response(output_content, status=upstream.status_code, mimetype='application/vnd.apple.mpegurl')
            resp.headers['Access-Control-Allow-Origin'] = '*'
            resp.headers['Access-Control-Allow-Headers'] = '*'
            resp.headers['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
            resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            return resp

        # Otherwise pipe media chunks (.ts, .aac, .m4s, etc.) with 128KB high-speed buffer
        def generate():
            for chunk in upstream.iter_content(chunk_size=131072):
                if chunk:
                    yield chunk

        status_code = upstream.status_code
        resp = Response(stream_with_context(generate()), status=status_code, content_type=content_type or 'video/mp2t')
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Headers'] = '*'
        resp.headers['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
        
        # Forward Content-Range and Accept-Ranges if partial content
        if 'Content-Range' in upstream.headers:
            resp.headers['Content-Range'] = upstream.headers['Content-Range']
        resp.headers['Accept-Ranges'] = 'bytes'

        # Cache media segments briefly (10 seconds) to avoid refetching duplicate chunks
        resp.headers['Cache-Control'] = 'public, max-age=10'
        return resp

    except Exception as e:
        return jsonify({'error': 'Proxy failed', 'server': server_mode, 'message': str(e)}), 502

@app.route('/api/ping')
def ping_stream():
    """Quick check for stream responsiveness across servers"""
    target = request.args.get('url', '')
    if not target:
        return jsonify({'online': False, 'error': 'No URL provided'})
    try:
        r = proxy_session.head(target, timeout=3.5, headers={'User-Agent': 'Mozilla/5.0'})
        return jsonify({'online': r.status_code in [200, 206, 301, 302]})
    except Exception as e:
        return jsonify({'online': False, 'error': str(e)})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
