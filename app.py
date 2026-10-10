import os
import re
import json
from urllib.parse import urljoin, quote, unquote
from flask import Flask, render_template, request, jsonify, Response, stream_with_context
import requests

app = Flask(__name__, static_folder='static', template_folder='templates')

# Load channels
CHANNELS_FILE = os.path.join(os.path.dirname(__file__), 'channels.json')
CHANNELS = []

def load_channels():
    global CHANNELS
    if os.path.exists(CHANNELS_FILE):
        try:
            with open(CHANNELS_FILE, 'r', encoding='utf-8') as f:
                CHANNELS = json.load(f)
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
            return jsonify(c)
    return jsonify({'error': 'Channel not found'}), 404

@app.route('/api/proxy')
def stream_proxy():
    """
    Stream and manifest proxy that injects permissive CORS headers and
    rewrites relative m3u8 URLs so HLS.js can play streams that would
    otherwise fail due to CORS or mixed content.
    """
    raw_url = request.args.get('url', '')
    if not raw_url:
        return "Missing url parameter", 400

    target_url = unquote(raw_url)
    
    # Custom headers imitating modern browser video player
    req_headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Referer': target_url
    }

    try:
        upstream = requests.get(target_url, headers=req_headers, stream=True, timeout=12)
        content_type = upstream.headers.get('Content-Type', '')

        # Check if this is an HLS playlist (.m3u8)
        is_m3u8 = (
            '.m3u8' in target_url.lower() or 
            'application/vnd.apple.mpegurl' in content_type.lower() or
            'application/x-mpegurl' in content_type.lower()
        )

        if is_m3u8:
            # Read and rewrite m3u8 playlist lines
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
                            return f'URI="/api/proxy?url={quote(full_nested)}"'
                        stripped = re.sub(r'URI="([^"]+)"', replace_uri, stripped)
                    rewritten_lines.append(stripped)
                else:
                    # Line is a child stream/chunk URL
                    abs_chunk_url = urljoin(target_url, stripped)
                    rewritten_lines.append(f"/api/proxy?url={quote(abs_chunk_url)}")

            output_content = '\n'.join(rewritten_lines)
            resp = Response(output_content, mimetype='application/vnd.apple.mpegurl')
            resp.headers['Access-Control-Allow-Origin'] = '*'
            resp.headers['Access-Control-Allow-Headers'] = '*'
            resp.headers['Cache-Control'] = 'no-cache'
            return resp

        # Otherwise pipe media chunks (.ts, .aac, .m4s, etc.)
        def generate():
            for chunk in upstream.iter_content(chunk_size=65536):
                if chunk:
                    yield chunk

        resp = Response(stream_with_context(generate()), content_type=content_type or 'video/mp2t')
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Headers'] = '*'
        resp.headers['Cache-Control'] = 'no-cache'
        return resp

    except Exception as e:
        return jsonify({'error': 'Proxy failed', 'message': str(e)}), 502

@app.route('/api/ping')
def ping_stream():
    """Quick check for stream responsiveness"""
    target = request.args.get('url', '')
    if not target:
        return jsonify({'online': False, 'error': 'No URL provided'})
    try:
        r = requests.head(target, timeout=4, headers={'User-Agent': 'Mozilla/5.0'})
        return jsonify({'online': r.status_code in [200, 206, 301, 302]})
    except Exception as e:
        return jsonify({'online': False, 'error': str(e)})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
