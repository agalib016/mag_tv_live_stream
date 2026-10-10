import urllib.request
import re
import json
import os

COUNTRIES = {
    'bd': {'name': 'Bangladesh', 'flag': '🇧🇩', 'lang': 'bangla'},
    'in': {'name': 'India', 'flag': '🇮🇳', 'lang': 'hindi'},
    'pk': {'name': 'Pakistan', 'flag': '🇵🇰', 'lang': 'urdu'}
}

CATEGORY_MAP = {
    'sports': ['sport', 'cricket', 'football'],
    'news': ['news', 'weather', 'business', 'press'],
    'religious': ['relig', 'islam', 'quran', 'azan', 'hindu', 'sikh', 'peace', 'bhakti', 'madani', 'vedic', 'satsang', 'aastha', 'sanskar', 'paigham'],
    'entertainment': ['entertainment', 'movie', 'cinema', 'music', 'comedy', 'drama', 'series', 'soap'],
}

def classify_channel(name, group):
    combined = f"{name} {group}".lower()
    for cat, keywords in CATEGORY_MAP.items():
        if any(kw in combined for kw in keywords):
            return cat
    return 'others'

def clean_channel_name(name):
    name = re.sub(r'\s*\(\d+p\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\[.*?\]', '', name)
    name = re.sub(r'\s*\(.*?fps\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\(Backup\)', '', name, flags=re.IGNORECASE)
    return name.strip()

def build_database():
    all_channels = []
    seen_urls = set()
    seen_names = set()

    for code, meta in COUNTRIES.items():
        url = f'https://iptv-org.github.io/iptv/countries/{code}.m3u'
        print(f"Fetching {meta['name']} playlist...")
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            content = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='ignore')
            lines = content.splitlines()
            
            i = 0
            while i < len(lines):
                line = lines[i].strip()
                if line.startswith('#EXTINF:'):
                    name_match = re.search(r',([^,]+)$', line)
                    logo_match = re.search(r'tvg-logo="([^"]+)"', line)
                    group_match = re.search(r'group-title="([^"]+)"', line)
                    
                    stream_url = ''
                    if i + 1 < len(lines):
                        next_line = lines[i+1].strip()
                        if next_line.startswith('http'):
                            stream_url = next_line
                            i += 1
                    
                    if stream_url and stream_url not in seen_urls:
                        raw_name = name_match.group(1).strip() if name_match else 'Live Channel'
                        c_name = clean_channel_name(raw_name)
                        logo = logo_match.group(1).strip() if logo_match else ''
                        group = group_match.group(1).strip() if group_match else 'General'
                        category = classify_channel(c_name, group)
                        
                        unique_key = f"{code}_{c_name.lower()}"
                        if unique_key not in seen_names:
                            seen_names.add(unique_key)
                            seen_urls.add(stream_url)
                            channel_id = f"{code}_{len(all_channels)+1}"
                            
                            all_channels.append({
                                'id': channel_id,
                                'name': c_name,
                                'original_name': raw_name,
                                'logo': logo or f"https://api.dicebear.com/7.x/identicon/svg?seed={c_name}",
                                'category': category,
                                'group': group,
                                'country': meta['name'],
                                'country_code': code,
                                'flag': meta['flag'],
                                'stream_url': stream_url,
                                'language': meta['lang'],
                                'is_active': True
                            })
                i += 1
            print(f"Loaded {len([c for c in all_channels if c['country_code'] == code])} channels for {meta['name']}")
        except Exception as e:
            print(f"Error fetching {code}: {e}")

    # Add verified high-reliability popular channels & fallbacks for key categories
    curated_highlights = [
        # Bangladesh
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
            'language': 'bangla',
            'featured': True
        },
        {
            'id': 'curated_bd_jamuna',
            'name': 'Jamuna TV',
            'logo': 'https://upload.wikimedia.org/wikipedia/en/7/7b/Jamuna_Television_logo.png',
            'category': 'news',
            'group': 'News',
            'country': 'Bangladesh',
            'country_code': 'bd',
            'flag': '🇧🇩',
            'stream_url': 'https://tvsen5.aynaott.com/jamunatv/index.m3u8',
            'language': 'bangla',
            'featured': True
        },
        {
            'id': 'curated_bd_channel24',
            'name': 'Channel 24',
            'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Channel_24_logo.svg/330px-Channel_24_logo.svg.png',
            'category': 'news',
            'group': 'News',
            'country': 'Bangladesh',
            'country_code': 'bd',
            'flag': '🇧🇩',
            'stream_url': 'https://tvsen5.aynaott.com/channel24/index.m3u8',
            'language': 'bangla',
            'featured': True
        },
        {
            'id': 'curated_bd_tsports',
            'name': 'T Sports Live',
            'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/T_Sports_logo.svg/330px-T_Sports_logo.svg.png',
            'category': 'sports',
            'group': 'Sports',
            'country': 'Bangladesh',
            'country_code': 'bd',
            'flag': '🇧🇩',
            'stream_url': 'https://live-tsports.akamaized.net/hls/live/2034523/tsports/master.m3u8',
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
            'stream_url': 'https://peacetv.vedge.infomaniak.com/live/peacetvbangla/playlist.m3u8',
            'language': 'bangla',
            'featured': True
        },
        {
            'id': 'curated_bd_gaanbangla',
            'name': 'Gaan Bangla',
            'logo': 'https://upload.wikimedia.org/wikipedia/en/c/cb/Gaan_Bangla_logo.png',
            'category': 'entertainment',
            'group': 'Music',
            'country': 'Bangladesh',
            'country_code': 'bd',
            'flag': '🇧🇩',
            'stream_url': 'https://tvsen5.aynaott.com/gaanbangla/index.m3u8',
            'language': 'bangla',
            'featured': True
        },
        # India
        {
            'id': 'curated_in_ddnews',
            'name': 'DD News Live',
            'logo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/DD_News_logo_2024.png/300px-DD_News_logo_2024.png',
            'category': 'news',
            'group': 'News',
            'country': 'India',
            'country_code': 'in',
            'flag': '🇮🇳',
            'stream_url': 'https://d35j504z0x2vu2.cloudfront.net/v1/master/0bc8e8376bd8417a1b6761138aa404e712990839/DD-News/master.m3u8',
            'language': 'hindi',
            'featured': True
        },
        {
            'id': 'curated_in_ddsports',
            'name': 'DD Sports Live',
            'logo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/DD_Sports_logo_2023.svg/300px-DD_Sports_logo_2023.svg.png',
            'category': 'sports',
            'group': 'Sports',
            'country': 'India',
            'country_code': 'in',
            'flag': '🇮🇳',
            'stream_url': 'https://d35j504z0x2vu2.cloudfront.net/v1/master/0bc8e8376bd8417a1b6761138aa404e712990839/DD-Sports/master.m3u8',
            'language': 'hindi',
            'featured': True
        },
        {
            'id': 'curated_in_indiatv',
            'name': 'India TV',
            'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/67/India_TV_logo.svg/330px-India_TV_logo.svg.png',
            'category': 'news',
            'group': 'News',
            'country': 'India',
            'country_code': 'in',
            'flag': '🇮🇳',
            'stream_url': 'https://indiatvnews-lh.akamaihd.net/i/ITV_1@183574/master.m3u8',
            'language': 'hindi',
            'featured': True
        },
        {
            'id': 'curated_in_sanskar',
            'name': 'Sanskar TV',
            'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Sanskar_TV_logo.jpg/250px-Sanskar_TV_logo.jpg',
            'category': 'religious',
            'group': 'Religious',
            'country': 'India',
            'country_code': 'in',
            'flag': '🇮🇳',
            'stream_url': 'https://live.sanskargroup.in/hls/sanskar.m3u8',
            'language': 'hindi',
            'featured': True
        },
        {
            'id': 'curated_in_aastha',
            'name': 'Aastha TV',
            'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/14/Aastha_tv_logo.jpg/250px-Aastha_tv_logo.jpg',
            'category': 'religious',
            'group': 'Religious',
            'country': 'India',
            'country_code': 'in',
            'flag': '🇮🇳',
            'stream_url': 'https://aastha.sanskargroup.in/hls/aastha.m3u8',
            'language': 'hindi',
            'featured': True
        },
        {
            'id': 'curated_in_9xjalwa',
            'name': '9X Jalwa',
            'logo': 'https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_9X_JALWA/images/LOGO_HD/image.png',
            'category': 'entertainment',
            'group': 'Music',
            'country': 'India',
            'country_code': 'in',
            'flag': '🇮🇳',
            'stream_url': 'https://wiselp.wiseplayout.com/9X_Jalwa/master.m3u8',
            'language': 'hindi',
            'featured': True
        },
        # Pakistan
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
            'language': 'urdu',
            'featured': True
        },
        {
            'id': 'curated_pk_ptvsports',
            'name': 'PTV Sports',
            'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/PTV_Sports_logo.svg/300px-PTV_Sports_logo.svg.png',
            'category': 'sports',
            'group': 'Sports',
            'country': 'Pakistan',
            'country_code': 'pk',
            'flag': '🇵🇰',
            'stream_url': 'https://cdn4.mjunoon.tv:8087/streamtest/105M/chunks.m3u8',
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
            'language': 'urdu',
            'featured': True
        },
        {
            'id': 'curated_pk_madani',
            'name': 'Madani Channel Urdu',
            'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b5/Madani_Channel_logo.png/250px-Madani_Channel_logo.png',
            'category': 'religious',
            'group': 'Religious',
            'country': 'Pakistan',
            'country_code': 'pk',
            'flag': '🇵🇰',
            'stream_url': 'https://madani.vedge.infomaniak.com/live/madanichannelurdu/playlist.m3u8',
            'language': 'urdu',
            'featured': True
        },
        {
            'id': 'curated_pk_humtv',
            'name': 'Hum TV',
            'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Hum_TV_Logo.svg/300px-Hum_TV_Logo.svg.png',
            'category': 'entertainment',
            'group': 'Drama',
            'country': 'Pakistan',
            'country_code': 'pk',
            'flag': '🇵🇰',
            'stream_url': 'https://ml-pull-dvc-myco.io:2096/AAJ_ENTERTAINMENT/index.m3u8',
            'language': 'urdu',
            'featured': True
        },
        # Global fallback test streams (sports, news, test streams)
        {
            'id': 'test_stream_1',
            'name': 'Red Bull TV (Live Sports)',
            'logo': 'https://resources.redbull.com/logos/redbulltv/logo.svg',
            'category': 'sports',
            'group': 'Sports',
            'country': 'Global',
            'country_code': 'in',
            'flag': '🌐',
            'stream_url': 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
            'language': 'english',
            'featured': True
        },
        {
            'id': 'test_stream_2',
            'name': 'Al Jazeera English HD',
            'logo': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Al_Jazeera_English_logo.svg/300px-Al_Jazeera_English_logo.svg.png',
            'category': 'news',
            'group': 'News',
            'country': 'Global',
            'country_code': 'bd',
            'flag': '🌐',
            'stream_url': 'https://live-hls-web-aje.getaj.net/AJE/01.m3u8',
            'language': 'english',
            'featured': True
        },
        {
            'id': 'test_stream_3',
            'name': 'NASA TV HD (Science & Cosmos)',
            'logo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/300px-NASA_logo.svg.png',
            'category': 'others',
            'group': 'Science',
            'country': 'Global',
            'country_code': 'in',
            'flag': '🌐',
            'stream_url': 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
            'language': 'english',
            'featured': True
        },
        {
            'id': 'test_stream_4',
            'name': 'Makkah Live (Masjid al-Haram)',
            'logo': 'https://i.imgur.com/JlqS6I4.jpeg',
            'category': 'religious',
            'group': 'Religious',
            'country': 'Global',
            'country_code': 'pk',
            'flag': '🕋',
            'stream_url': 'https://win.hollive.net:8443/live/quran.m3u8',
            'language': 'urdu',
            'featured': True
        },
        {
            'id': 'test_stream_5',
            'name': 'Big Buck Bunny (Ultra HD Test)',
            'logo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/260px-Big_buck_bunny_poster_big.jpg',
            'category': 'entertainment',
            'group': 'Animation',
            'country': 'Global',
            'country_code': 'bd',
            'flag': '🎬',
            'stream_url': 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            'language': 'english',
            'featured': False
        }
    ]

    # Prepend curated highlights
    final_channels = curated_highlights + all_channels

    output_path = os.path.join(os.path.dirname(__file__), 'channels.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(final_channels, f, ensure_ascii=False, indent=2)

    print(f"Total curated and parsed channels saved: {len(final_channels)}")

if __name__ == '__main__':
    build_database()
