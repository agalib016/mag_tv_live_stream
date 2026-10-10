import urllib.request
import json

def test():
    # 1. Test index page
    res = urllib.request.urlopen('http://127.0.0.1:5000/')
    html = res.read().decode('utf-8')
    assert 'MAG Tv' in html
    assert 'qualityMenuDropdown' in html
    assert 'playerResolutionBadge' in html
    assert 'data-category="sports"' in html
    assert 'data-category="news"' in html
    assert 'data-category="religious"' in html
    assert 'data-category="entertainment"' in html
    assert 'data-category="others"' in html
    print('HTML nav buttons, MAG Tv logo, and resolution controls verified.')

    # 2. Test API channels
    data = json.loads(urllib.request.urlopen('http://127.0.0.1:5000/api/channels').read().decode('utf-8'))
    print('Total channels returned:', data['total'])
    assert data['total'] > 0

    # 3. Test API categories
    sports = json.loads(urllib.request.urlopen('http://127.0.0.1:5000/api/channels?category=sports').read().decode('utf-8'))
    print('Sports channels count:', sports['total'])

    news = json.loads(urllib.request.urlopen('http://127.0.0.1:5000/api/channels?category=news').read().decode('utf-8'))
    print('News channels count:', news['total'])

    religious = json.loads(urllib.request.urlopen('http://127.0.0.1:5000/api/channels?category=religious').read().decode('utf-8'))
    print('Religious channels count:', religious['total'])

    entertainment = json.loads(urllib.request.urlopen('http://127.0.0.1:5000/api/channels?category=entertainment').read().decode('utf-8'))
    print('Entertainment channels count:', entertainment['total'])

    others = json.loads(urllib.request.urlopen('http://127.0.0.1:5000/api/channels?category=others').read().decode('utf-8'))
    print('Others channels count:', others['total'])

    # 4. Test API countries
    bd = json.loads(urllib.request.urlopen('http://127.0.0.1:5000/api/channels?country=bd').read().decode('utf-8'))
    print('Bangladesh channels count:', bd['total'])

    ind = json.loads(urllib.request.urlopen('http://127.0.0.1:5000/api/channels?country=in').read().decode('utf-8'))
    print('India channels count:', ind['total'])

    pk = json.loads(urllib.request.urlopen('http://127.0.0.1:5000/api/channels?country=pk').read().decode('utf-8'))
    print('Pakistan channels count:', pk['total'])

    # 5. Test stats
    stats = json.loads(urllib.request.urlopen('http://127.0.0.1:5000/api/stats').read().decode('utf-8'))
    print('Stats:', json.dumps(stats, indent=2))

    # 6. Test static files
    css = urllib.request.urlopen('http://127.0.0.1:5000/static/css/style.css').read().decode('utf-8')
    assert '[data-theme="dark"]' in css
    assert ':root' in css
    assert 'channel-card' in css
    print('CSS verified successfully, length:', len(css))

    js_app = urllib.request.urlopen('http://127.0.0.1:5000/static/js/app.js').read().decode('utf-8')
    assert 'class LiveTvApp' in js_app
    print('App.js verified successfully, length:', len(js_app))

    js_player = urllib.request.urlopen('http://127.0.0.1:5000/static/js/player.js').read().decode('utf-8')
    assert 'class LivePlayer' in js_player
    print('Player.js verified successfully, length:', len(js_player))

    js_i18n = urllib.request.urlopen('http://127.0.0.1:5000/static/js/i18n.js').read().decode('utf-8')
    assert 'bn:' in js_i18n and 'hi:' in js_i18n and 'ur:' in js_i18n
    print('i18n.js verified successfully, length:', len(js_i18n))

    print('\nALL TESTS PASSED!')

if __name__ == '__main__':
    test()
