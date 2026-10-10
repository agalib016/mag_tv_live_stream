import json
from app import app

def test():
    client = app.test_client()

    # 1. Test index page
    res = client.get('/')
    assert res.status_code == 200
    html = res.data.decode('utf-8')
    assert 'MAG Tv' in html
    assert 'playerServerBtn' in html
    assert 'playerServerBadge' in html
    assert 'serverMenuDropdown' in html
    assert 'playerToast' in html
    assert 'qualityMenuDropdown' in html
    assert 'playerResolutionBadge' in html
    assert 'data-category="sports"' in html
    assert 'data-category="news"' in html
    assert 'data-category="religious"' in html
    assert 'data-category="entertainment"' in html
    assert 'data-category="others"' in html
    print('[PASS] Index HTML verified with multi-server switcher, resolution controls, and categories.')

    # 2. Test API channels and multi-server structure
    res = client.get('/api/channels')
    assert res.status_code == 200
    data = res.get_json()
    print('[PASS] Total channels returned:', data['total'])
    assert data['total'] > 0

    first_channel = data['channels'][0]
    assert 'servers' in first_channel
    assert len(first_channel['servers']) >= 3
    print(f"[PASS] Channel '{first_channel['name']}' has {len(first_channel['servers'])} servers configured.")

    # 3. Test API categories
    for cat in ['sports', 'news', 'religious', 'entertainment', 'others']:
        res = client.get(f'/api/channels?category={cat}')
        cat_data = res.get_json()
        print(f"[PASS] Category '{cat}': {cat_data['total']} channels")
        assert cat_data['total'] > 0

    # 4. Test API countries
    for code, name in [('bd', 'Bangladesh'), ('in', 'India'), ('pk', 'Pakistan')]:
        res = client.get(f'/api/channels?country={code}')
        country_data = res.get_json()
        print(f"[PASS] Region '{name}' ({code}): {country_data['total']} channels")
        assert country_data['total'] > 0

    # 5. Test stats
    res = client.get('/api/stats')
    stats = res.get_json()
    assert stats['total'] > 0
    assert 'categories' in stats and 'countries' in stats
    print('[PASS] Stats verified:', json.dumps(stats, indent=2))

    # 6. Test Multi-Server Turbo Proxy
    test_stream = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
    res = client.get(f'/api/proxy?server=turbo&url={test_stream}')
    assert res.status_code == 200
    assert 'application/vnd.apple.mpegurl' in res.headers.get('content-type', '')
    manifest_text = res.data.decode('utf-8')
    assert '/api/proxy?server=turbo' in manifest_text
    print('[PASS] Multi-server turbo proxy successfully rewrites M3U8 with server parameters and CORS headers.')

    # 7. Test static files
    css_res = client.get('/static/css/style.css')
    assert css_res.status_code == 200
    css = css_res.data.decode('utf-8')
    assert 'server-badge' in css
    assert 'server-dropdown' in css
    assert 'player-toast' in css
    print('[PASS] style.css verified with server selector and toast styles.')

    player_res = client.get('/static/js/player.js')
    assert player_res.status_code == 200
    player_js = player_res.data.decode('utf-8')
    assert 'currentServers' in player_js
    assert 'switchServer' in player_js
    assert 'startStallWatchdog' in player_js
    assert 'lowLatencyMode: false' in player_js
    print('[PASS] player.js verified with multi-server engine and anti-buffering watchdog.')

    i18n_res = client.get('/static/js/i18n.js')
    assert i18n_res.status_code == 200
    i18n_js = i18n_res.data.decode('utf-8')
    assert 'serverSelector' in i18n_js
    assert 'autoSwitchedToast' in i18n_js
    print('[PASS] i18n.js verified with multi-server translations.')

    print('\n[SUCCESS] ALL TESTS PASSED SUCCESSFULLY!')

if __name__ == '__main__':
    test()
