import json
import os
import requests
from urllib.parse import quote
from concurrent.futures import ThreadPoolExecutor

CHANNELS_PATH = os.path.join(os.path.dirname(__file__), 'channels.json')

CURATED_CHANNELS = [
    # --- BANGLADESH ---
    {
        'id': 'curated_bd_somoy',
        'name': 'Somoy TV',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Somoy_TV_logo.svg/300px-Somoy_TV_logo.svg.png',
        'category': 'news',
        'group': 'News',
        'country': 'Bangladesh',
        'country_code': 'bd',
        'flag': '🇧🇩',
        'stream_url': 'https://tvsen5.aynaott.com/somoytv/index.m3u8',
        'backup_urls': [
            'http://tvsen5.aynascope.net/somoytv/index.m3u8',
            'https://stream.shariarsuvo.com/hls5/somoy.m3u8'
        ],
        'language': 'bangla',
        'featured': True
    },
    {
        'id': 'curated_bd_dbc',
        'name': 'DBC News HD',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/DBC_News_logo.svg/300px-DBC_News_logo.svg.png',
        'category': 'news',
        'group': 'News',
        'country': 'Bangladesh',
        'country_code': 'bd',
        'flag': '🇧🇩',
        'stream_url': 'https://tvsen6.aynaott.com/pF66Tkz0qFwP2aMMqHyt/index.m3u8',
        'backup_urls': [
            'http://tvsen5.aynascope.net/dbcnews/index.m3u8'
        ],
        'language': 'bangla',
        'featured': True
    },
    {
        'id': 'curated_bd_ekattor',
        'name': 'Ekattor TV HD',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/23/Ekattor_TV_logo.svg/300px-Ekattor_TV_logo.svg.png',
        'category': 'news',
        'group': 'News',
        'country': 'Bangladesh',
        'country_code': 'bd',
        'flag': '🇧🇩',
        'stream_url': 'https://tvsen6.aynaott.com/EWDrV5QskgarZEUBb3pU/index.m3u8',
        'backup_urls': [
            'http://tvsen5.aynascope.net/ekattortv/index.m3u8'
        ],
        'language': 'bangla',
        'featured': True
    },
    {
        'id': 'curated_bd_independent',
        'name': 'Independent TV',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/90/Independent_Television_%28Bangladesh%29_logo.svg/300px-Independent_Television_%28Bangladesh%29_logo.svg.png',
        'category': 'news',
        'group': 'News',
        'country': 'Bangladesh',
        'country_code': 'bd',
        'flag': '🇧🇩',
        'stream_url': 'https://tvsen6.aynaott.com/Wef2Vj67njeYGDqQNFB9/index.m3u8',
        'backup_urls': [
            'http://tvsen5.aynascope.net/independenttv/index.m3u8'
        ],
        'language': 'bangla',
        'featured': True
    },
    {
        'id': 'curated_bd_maasranga',
        'name': 'Maasranga TV HD',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Maasranga_TV_logo.svg/300px-Maasranga_TV_logo.svg.png',
        'category': 'entertainment',
        'group': 'General',
        'country': 'Bangladesh',
        'country_code': 'bd',
        'flag': '🇧🇩',
        'stream_url': 'http://tvsen5.aynascope.net/maasrangatv/index.m3u8',
        'backup_urls': [
            'https://tvsen5.aynaott.com/maasrangatv/index.m3u8'
        ],
        'language': 'bangla',
        'featured': True
    },
    {
        'id': 'curated_bd_banglavision',
        'name': 'Bangla Vision',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0d/Banglavision_logo.svg/300px-Banglavision_logo.svg.png',
        'category': 'entertainment',
        'group': 'General',
        'country': 'Bangladesh',
        'country_code': 'bd',
        'flag': '🇧🇩',
        'stream_url': 'https://tvsen5.aynaott.com/banglavision/index.m3u8',
        'backup_urls': [
            'http://tvsen5.aynascope.net/banglavision/index.m3u8'
        ],
        'language': 'bangla',
        'featured': True
    },
    {
        'id': 'curated_bd_boishakhi',
        'name': 'Boishakhi TV',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/36/Boishakhi_Television_logo.svg/300px-Boishakhi_Television_logo.svg.png',
        'category': 'entertainment',
        'group': 'General',
        'country': 'Bangladesh',
        'country_code': 'bd',
        'flag': '🇧🇩',
        'stream_url': 'https://boishakhi.sonarbanglatv.com/boishakhi/boishakhitv/index.m3u8',
        'backup_urls': [
            'http://tvsen5.aynascope.net/boishakhitv/index.m3u8'
        ],
        'language': 'bangla',
        'featured': True
    },
    {
        'id': 'curated_bd_ekushey',
        'name': 'Ekushey TV',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/Ekushey_Television_logo.svg/300px-Ekushey_Television_logo.svg.png',
        'category': 'entertainment',
        'group': 'General',
        'country': 'Bangladesh',
        'country_code': 'bd',
        'flag': '🇧🇩',
        'stream_url': 'https://ekusheyserver.com/etvlivesn.m3u8',
        'backup_urls': [],
        'language': 'bangla',
        'featured': True
    },
    {
        'id': 'curated_bd_duronto',
        'name': 'Duronto TV (Kids & Family)',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2f/Duronto_TV_logo.svg/300px-Duronto_TV_logo.svg.png',
        'category': 'entertainment',
        'group': 'Kids',
        'country': 'Bangladesh',
        'country_code': 'bd',
        'flag': '🇧🇩',
        'stream_url': 'https://tvsen6.aynaott.com/6xyZ3N4oHv2KBJdB6W4p/index.m3u8',
        'backup_urls': [],
        'language': 'bangla',
        'featured': True
    },
    {
        'id': 'curated_bd_atnbangla',
        'name': 'ATN Bangla',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/ATN_Bangla_logo.svg/300px-ATN_Bangla_logo.svg.png',
        'category': 'entertainment',
        'group': 'General',
        'country': 'Bangladesh',
        'country_code': 'bd',
        'flag': '🇧🇩',
        'stream_url': 'http://tvsen5.aynascope.net/atnbangla/index.m3u8',
        'backup_urls': [],
        'language': 'bangla',
        'featured': True
    },
    {
        'id': 'curated_bd_ntv',
        'name': 'NTV Bangladesh',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/NTV_Bangladesh_logo.svg/300px-NTV_Bangladesh_logo.svg.png',
        'category': 'entertainment',
        'group': 'General',
        'country': 'Bangladesh',
        'country_code': 'bd',
        'flag': '🇧🇩',
        'stream_url': 'https://tvsen5.aynaott.com/xV4jEKf3D9zc/index.m3u8',
        'backup_urls': [],
        'language': 'bangla',
        'featured': True
    },
    {
        'id': 'curated_bd_rtv',
        'name': 'RTV Bangladesh',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/RTV_Bangladesh_logo.svg/300px-RTV_Bangladesh_logo.svg.png',
        'category': 'entertainment',
        'group': 'General',
        'country': 'Bangladesh',
        'country_code': 'bd',
        'flag': '🇧🇩',
        'stream_url': 'http://tvsen5.aynascope.net/RtvHD/index.m3u8',
        'backup_urls': [],
        'language': 'bangla',
        'featured': True
    },
    {
        'id': 'curated_bd_peace',
        'name': 'Peace TV Bangla',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7e/Peace_TV_Bangla_Logo.jpg/250px-Peace_TV_Bangla_Logo.jpg',
        'category': 'religious',
        'group': 'Religious',
        'country': 'Bangladesh',
        'country_code': 'bd',
        'flag': '🇧🇩',
        'stream_url': 'https://dzkyvlfyge.erbvr.com/PeaceTvBangla/index.m3u8',
        'backup_urls': [
            'https://peacetv.vedge.infomaniak.com/live/peacetvbangla/playlist.m3u8'
        ],
        'language': 'bangla',
        'featured': True
    },
    {
        'id': 'curated_bd_starjalsha',
        'name': 'Star Jalsha HD',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Star_Jalsha_logo.svg/300px-Star_Jalsha_logo.svg.png',
        'category': 'entertainment',
        'group': 'Drama',
        'country': 'Bangladesh',
        'country_code': 'bd',
        'flag': '🇧🇩',
        'stream_url': 'http://103.151.60.162:2122/play/a00w/index.m3u8?hls',
        'backup_urls': [
            'https://da86m1sqpm3o0.cloudfront.net/28072023/smil:starjalsha.smil/index.m3u8'
        ],
        'language': 'bangla',
        'featured': True
    },
    {
        'id': 'curated_bd_zeebangla',
        'name': 'Zee Bangla',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1b/Zee_Bangla_logo.svg/300px-Zee_Bangla_logo.svg.png',
        'category': 'entertainment',
        'group': 'Drama',
        'country': 'Bangladesh',
        'country_code': 'bd',
        'flag': '🇧🇩',
        'stream_url': 'http://103.151.60.162:2122/play/a011/index.m3u8?hls',
        'backup_urls': [
            'https://d1g8wgjurz8via.cloudfront.net/bpk-tv/ColorsHD/default/index.m3u8'
        ],
        'language': 'bangla',
        'featured': True
    },

    # --- INDIA ---
    {
        'id': 'curated_in_indiatoday',
        'name': 'India Today HD',
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/India_Today_logo.svg/300px-India_Today_logo.svg.png',
        'category': 'news',
        'group': 'News',
        'country': 'India',
        'country_code': 'in',
        'flag': '🇮🇳',
        'stream_url': 'https://feeds.intoday.in/hltapps/api/master.m3u8',
        'backup_urls': [],
        'language': 'hindi',
        'featured': True
    },
    {
        'id': 'curated_in_wion',
        'name': 'WION World News',
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/WION_logo.svg/300px-WION_logo.svg.png',
        'category': 'news',
        'group': 'News',
        'country': 'India',
        'country_code': 'in',
        'flag': '🇮🇳',
        'stream_url': 'https://d7x8z4yuq42qn.cloudfront.net/index_7.m3u8',
        'backup_urls': [],
        'language': 'english',
        'featured': True
    },
    {
        'id': 'curated_in_newsnation',
        'name': 'News Nation',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/25/News_Nation_logo.png/300px-News_Nation_logo.png',
        'category': 'news',
        'group': 'News',
        'country': 'India',
        'country_code': 'in',
        'flag': '🇮🇳',
        'stream_url': 'https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/6cd2f649739a45ca9de1daf81cc7d0f2/index.m3u8',
        'backup_urls': [],
        'language': 'hindi',
        'featured': True
    },
    {
        'id': 'curated_in_9xjalwa',
        'name': '9X Jalwa HD',
        'logo': 'https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_9X_JALWA/images/LOGO_HD/image.png',
        'category': 'entertainment',
        'group': 'Music',
        'country': 'India',
        'country_code': 'in',
        'flag': '🇮🇳',
        'stream_url': 'https://wiselp.wiseplayout.com/9X_Jalwa/master.m3u8',
        'backup_urls': [],
        'language': 'hindi',
        'featured': True
    },
    {
        'id': 'curated_in_redbull',
        'name': 'Red Bull TV (Live Sports)',
        'logo': 'https://resources.redbull.com/logos/redbulltv/logo.svg',
        'category': 'sports',
        'group': 'Sports',
        'country': 'Global',
        'country_code': 'in',
        'flag': '🏆',
        'stream_url': 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
        'backup_urls': [],
        'language': 'english',
        'featured': True
    },
    {
        'id': 'curated_in_nasatv',
        'name': 'NASA TV HD (Cosmos & Science)',
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/300px-NASA_logo.svg.png',
        'category': 'others',
        'group': 'Science',
        'country': 'Global',
        'country_code': 'in',
        'flag': '🚀',
        'stream_url': 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
        'backup_urls': [],
        'language': 'english',
        'featured': True
    },
    {
        'id': 'curated_in_trtworld',
        'name': 'TRT World Live',
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/TRT_World_logo.svg/300px-TRT_World_logo.svg.png',
        'category': 'news',
        'group': 'News',
        'country': 'Global',
        'country_code': 'in',
        'flag': '🌐',
        'stream_url': 'https://tv-trtworld.medya.trt.com.tr/master.m3u8',
        'backup_urls': [],
        'language': 'english',
        'featured': True
    },
    {
        'id': 'curated_in_dwnews',
        'name': 'DW News English',
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Deutsche_Welle_logo_2012.svg/300px-Deutsche_Welle_logo_2012.svg.png',
        'category': 'news',
        'group': 'News',
        'country': 'Global',
        'country_code': 'in',
        'flag': '🌐',
        'stream_url': 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/master.m3u8',
        'backup_urls': [],
        'language': 'english',
        'featured': True
    },

    # --- PAKISTAN ---
    {
        'id': 'curated_pk_asports',
        'name': 'A Sports HD',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/A_Sports_HD_logo.svg/300px-A_Sports_HD_logo.svg.png',
        'category': 'sports',
        'group': 'Sports',
        'country': 'Pakistan',
        'country_code': 'pk',
        'flag': '🇵🇰',
        'stream_url': 'https://cdn4.mjunoon.tv:8087/streamtest/145M/chunks.m3u8',
        'backup_urls': [
            'https://tvsen6.aynaott.com/zv68oqPDu7MZZwmHhRxt/index.m3u8'
        ],
        'language': 'urdu',
        'featured': True
    },
    {
        'id': 'curated_pk_geonews',
        'name': 'Geo News HD',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Geo_News_logo.svg/300px-Geo_News_logo.svg.png',
        'category': 'news',
        'group': 'News',
        'country': 'Pakistan',
        'country_code': 'pk',
        'flag': '🇵🇰',
        'stream_url': 'https://cdn4.mjunoon.tv:8087/streamtest/146M/chunks.m3u8',
        'backup_urls': [],
        'language': 'urdu',
        'featured': True
    },
    {
        'id': 'curated_pk_arynews',
        'name': 'ARY News',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6f/ARY_News_logo.svg/300px-ARY_News_logo.svg.png',
        'category': 'news',
        'group': 'News',
        'country': 'Pakistan',
        'country_code': 'pk',
        'flag': '🇵🇰',
        'stream_url': 'http://92news.vdn.dstreamone.net/92newshd/92hd/playlist.m3u8',
        'backup_urls': [],
        'language': 'urdu',
        'featured': True
    },
    {
        'id': 'curated_pk_8xm',
        'name': '8XM Music HD',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/8XM_logo.png/250px-8XM_logo.png',
        'category': 'entertainment',
        'group': 'Music',
        'country': 'Pakistan',
        'country_code': 'pk',
        'flag': '🇵🇰',
        'stream_url': 'https://cdn4.mjunoon.tv:8087/streamtest/131M/chunks.m3u8',
        'backup_urls': [],
        'language': 'urdu',
        'featured': True
    },
    {
        'id': 'curated_pk_khyber',
        'name': 'Khyber News',
        'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Khyber_News_logo.png/250px-Khyber_News_logo.png',
        'category': 'news',
        'group': 'News',
        'country': 'Pakistan',
        'country_code': 'pk',
        'flag': '🇵🇰',
        'stream_url': 'https://cdn4.mjunoon.tv:8087/streamtest/144M/chunks.m3u8',
        'backup_urls': [],
        'language': 'urdu',
        'featured': True
    },
    {
        'id': 'test_stream_mux',
        'name': 'Big Buck Bunny (4K / 60fps Verified Test)',
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/260px-Big_buck_bunny_poster_big.jpg',
        'category': 'entertainment',
        'group': 'Animation',
        'country': 'Global',
        'country_code': 'in',
        'flag': '🎬',
        'stream_url': 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        'backup_urls': [],
        'language': 'english',
        'featured': False
    }
]

def generate_channel_servers(channel):
    primary_url = channel.get('stream_url', '')
    backups = channel.get('backup_urls', [])
    servers = []
    
    # Server 1: Direct CDN (fastest when CORS allows)
    servers.append({
        'id': 'srv_1',
        'name': 'Server 1 (High-Speed Direct)',
        'badge': '⚡ Direct CDN',
        'url': primary_url,
        'type': 'direct',
        'description': 'Direct origin streaming with minimal latency'
    })
    
    # Server 2: Turbo Proxy
    servers.append({
        'id': 'srv_2',
        'name': 'Server 2 (Turbo Buffer-Free Proxy)',
        'badge': '🚀 Turbo Buffer-Free',
        'url': f"/api/proxy?server=turbo&url={quote(primary_url)}",
        'type': 'proxy',
        'description': 'Persistent Keep-Alive connection pool with 128KB prebuffering'
    })
    
    # Server 3: Edge Bypass Route
    servers.append({
        'id': 'srv_3',
        'name': 'Server 3 (Edge Bypass Route)',
        'badge': '🛡️ Edge Bypass',
        'url': f"/api/proxy?server=edge&url={quote(primary_url)}",
        'type': 'proxy',
        'description': 'AppleCoreMedia headers to bypass geo-restrictions & CORS locks'
    })
    
    # Server 4 & 5
    if backups and len(backups) > 0:
        backup_url = backups[0]
        servers.append({
            'id': 'srv_4',
            'name': 'Server 4 (Alternative Broadcast Feed)',
            'badge': '📡 Alt Source',
            'url': backup_url,
            'type': 'direct',
            'description': 'Secondary broadcast transmission line'
        })
        servers.append({
            'id': 'srv_5',
            'name': 'Server 5 (Backup Cloud Proxy)',
            'badge': '🌐 Cloud Mirror',
            'url': f"/api/proxy?server=backup&url={quote(backup_url)}",
            'type': 'proxy',
            'description': 'Proxied secondary broadcast source'
        })
    else:
        servers.append({
            'id': 'srv_4',
            'name': 'Server 4 (Backup Cloud Proxy)',
            'badge': '🌐 Cloud Mirror',
            'url': f"/api/proxy?server=backup&url={quote(primary_url)}",
            'type': 'proxy',
            'description': 'Failover cloud-routed proxy'
        })
        
    return servers

def build_database():
    print("Building multi-server channel database...")
    # Load and populate channels with multi-servers
    if os.path.exists(CHANNELS_PATH):
        with open(CHANNELS_PATH, 'r', encoding='utf-8') as f:
            channels = json.load(f)
    else:
        channels = list(CURATED_CHANNELS)

    for ch in channels:
        ch['servers'] = generate_channel_servers(ch)
        if 'backup_urls' not in ch:
            ch['backup_urls'] = []

    with open(CHANNELS_PATH, 'w', encoding='utf-8') as f:
        json.dump(channels, f, ensure_ascii=False, indent=2)

    print(f"Channels database built with {len(channels)} multi-server channels!")

if __name__ == '__main__':
    build_database()
