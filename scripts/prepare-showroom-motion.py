"""Capture the actual Retro Messenger widgets for the local storefront showcase.

Run from the parent repo with .venv/Scripts/python LandingPage/scripts/prepare-showroom-motion.py.
Uses the existing SE harness builder. Only images and silent video are public;
source-containing harnesses, intermediate frames and provenance stay in .preview.
"""
import argparse
import asyncio
import hashlib
import io
import json
import math
from pathlib import Path
import subprocess
import sys
import time

SITE = Path(__file__).resolve().parents[1]
ROOT = SITE.parent
sys.path.insert(0, str(ROOT / 'tools'))
import pin_video
from pin_video import build_member_harness, find_ffmpeg
from PIL import Image
from playwright.async_api import async_playwright

OUT = SITE / 'public' / 'showroom' / 'messenger'
WORK = SITE / '.preview' / 'motion-renders'
OUT.mkdir(parents=True, exist_ok=True)
WORK.mkdir(parents=True, exist_ok=True)
MANIFEST = {'purpose': 'Actual source-widget recordings; all event names are fictional; sound off.', 'assets': []}
if (WORK / 'asset-provenance.json').exists():
    MANIFEST['assets'] = json.loads((WORK / 'asset-provenance.json').read_text(encoding='utf-8')).get('assets', [])
FFMPEG = find_ffmpeg()
pin_video.CHAT_LINES = [
    ('PixelPal', 'hey everyone!'), ('CozyCrew', 'one more game?'),
    ('NightOwl', 'always one more'), ('PixelPal', 'high score incoming'),
    ('CozyCrew', 'snacks acquired'), ('NightOwl', 'the ghosts have a plan'),
    ('PixelPal', 'my plan is panic'), ('CozyCrew', 'a classic strategy'),
    ('RetroFan', 'just got here, hi chat!'), ('PixelPal', 'welcome to the arcade'),
    ('NightOwl', 'did somebody say snacks?'), ('CozyCrew', 'there are always snacks'),
    ('ByteBuddy', 'this has sleepover energy'), ('RetroFan', 'I brought the good controller'),
    ('PixelPal', 'the one with the sticky button?'), ('ByteBuddy', 'it builds character'),
    ('NightOwl', 'that is what they all say'), ('CozyCrew', 'one more round'),
    ('RetroFan', 'we have said that a lot'), ('PixelPal', 'a proud tradition'),
    ('ByteBuddy', 'new high score tonight'), ('NightOwl', 'no pressure'),
    ('CozyCrew', 'only all of chat watching'), ('PixelPal', 'totally normal'),
]

def run_ffmpeg(args):
    result = subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-y', *args], capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(result.stderr)

def source_hash(slug):
    se = ROOT / 'widgets' / slug / 'streamelements'
    return hashlib.sha256(b''.join((se / f).read_bytes() for f in ['html.txt', 'css.txt', 'js.txt', 'data.txt'])).hexdigest()

def record(name, slug, overrides, dimensions, **extra):
    MANIFEST['assets'] = [asset for asset in MANIFEST['assets'] if asset['name'] != name]
    MANIFEST['assets'].append({'name':name, 'sourceSlug':slug, 'sourceHash':source_hash(slug), 'overrides':overrides, 'dimensions':dimensions, **extra})
    (WORK / 'asset-provenance.json').write_text(json.dumps(MANIFEST, indent=2), encoding='utf-8')
    print(name, dimensions, flush=True)

async def new_capture(browser, name, slug, kind, size, overrides, video=False):
    folder = WORK / name
    folder.mkdir(exist_ok=True)
    harness = build_member_harness(slug, kind, folder, kick_delay_ms=600000, overrides=overrides)
    if not harness:
        raise RuntimeError('Missing source: ' + slug)
    opts = {'viewport':dict(zip(['width','height'],size)), 'device_scale_factor':1}
    if video:
        opts.update(record_video_dir=str(folder / 'recording'), record_video_size=opts['viewport'])
    context = await browser.new_context(**opts)
    await context.add_init_script('window.WebFont={load:function(){}};')
    await context.route('http**://**', lambda route:route.abort())
    page = await context.new_page()
    errors = []
    page.on('pageerror', lambda error:errors.append(str(error)))
    await page.goto((folder / harness).as_uri())
    await page.wait_for_timeout(100)
    return context, page, folder, errors

async def fire(page, listener, name, i=0, **extra):
    await page.evaluate("arg=>window.dispatchEvent(new CustomEvent('onEventReceived',{detail:{listener:arg.listener,event:arg.event}}))", {
        'listener':listener, 'event':{'name':name,'displayName':name,'activityId':f'showcase-{name}-{i}',**extra}})

async def render_chat(browser):
    slug='sku-legacy-17-retro-messenger'
    overrides={'windowTitle':'RetroStreamer - Instant Message','warningName':'RetroStreamer', 'fontSize':17, 'namesSize':17,'uiScale':1,'msgLimitAmount':24,
               'enable7tv':'off','enableBttv':'off','enableFfz':'off','alertsEnabled':'off'}
    context,page,folder,errors=await new_capture(browser,'chat',slug,'chat',(400,660),overrides,video=True)
    await page.evaluate('window.__pinKick()')
    await page.wait_for_timeout(5500)
    raw=await page.screenshot(omit_background=True)
    img=Image.open(io.BytesIO(raw)).crop((4,4,396,656))
    img.save(OUT/'chat.png');img.save(OUT/'chat.webp',lossless=True)
    for i,(who,message) in enumerate([('PixelPal','okay, here we go'),('CozyCrew','I believe in you'),('NightOwl','famous last words'),('PixelPal','one more game, then bed')]):
        await page.evaluate("([who,text,i])=>window.dispatchEvent(new CustomEvent('onEventReceived',{detail:{listener:'message',event:{data:{displayName:who,nick:who,userId:'demo-'+who,msgId:'motion-'+i,text,sanitized:'',badges:[],emotes:[]}}}}))",[who,message,i])
        await page.wait_for_timeout(2000)
    path=await page.video.path()
    await context.close()
    if errors:raise RuntimeError(errors)
    run_ffmpeg(['-i',str(path),'-ss','5.5','-t','8','-vf','crop=392:652:4:4','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(OUT/'chat.mp4')])
    record('chat',slug,overrides,[392,652],durationSeconds=8,crop=[4,4,396,656])

async def render_alert(browser, name, listener, display_name, **event):
    slug='sku-mk-01-alert-popups'
    overrides={'holdSeconds':2.2,'gapSeconds':.4,'soundEnabled':'off','fontSize':18,'anim':'popup'}
    context,page,folder,errors=await new_capture(browser,name,slug,'alert',(420,140),overrides)
    fps=12;seconds=4.2;frames=math.ceil(fps*seconds)
    start=time.monotonic();fired=False;poster=False
    for index in range(frames):
        target=start+index/fps
        await asyncio.sleep(max(0,target-time.monotonic()))
        if index>=3 and not fired:
            await fire(page,listener,display_name,**event);fired=True
        png=await page.screenshot(omit_background=True)
        (folder / f'frame-{index:04d}.png').write_bytes(png)
        if index==14:
            image=Image.open(io.BytesIO(png));image.save(OUT/f'{name}.webp',lossless=True)
            if name=='follow':
                crop=image.crop(image.getbbox());crop.save(OUT/'alert.webp',lossless=True);crop.save(OUT/'alert.png')
            poster=True
    await context.close()
    if errors:raise RuntimeError(errors)
    run_ffmpeg(['-framerate',str(fps),'-i',str(folder/'frame-%04d.png'),'-frames:v',str(frames),'-an','-c:v','libvpx-vp9','-pix_fmt','yuva420p','-b:v','0','-crf','25','-auto-alt-ref','0',str(OUT/f'{name}.webm')])
    record(name,slug,overrides,[420,140],durationSeconds=frames/fps,alpha=True,event={'listener':listener,'name':display_name,**event})

async def render_goal(browser):
    slug='sku-mk-05-goal-bars'
    overrides={'goalTarget':50,'startCount':42,'useSession':'off'}
    context,page,folder,errors=await new_capture(browser,'goal',slug,'goal',(720,200),overrides,video=True)
    box=await page.locator('.goal-panel').bounding_box()
    clip={'x':int(box['x']),'y':int(box['y']),'width':int(box['width'])//2*2,'height':int(box['height'])//2*2}
    raw=await page.screenshot(clip=clip,omit_background=True)
    image=Image.open(io.BytesIO(raw));image.save(OUT/'goal.webp',lossless=True);image.save(OUT/'goal.png')
    await page.wait_for_timeout(600)
    for i in range(8):
        await fire(page,'follower-latest',['PixelPal','CozyCrew','NightOwl','RetroFan','ArcadeAce','ByteBuddy','NeonNora','NewBuddy'][i],i)
        await page.wait_for_timeout(380)
    await page.wait_for_timeout(1200)
    path=await page.video.path()
    await context.close()
    if errors:raise RuntimeError(errors)
    x,y,w,h=[clip[k] for k in ['x','y','width','height']]
    run_ffmpeg(['-i',str(path),'-ss','0.2','-t','4.8','-vf',f'crop={w}:{h}:{x}:{y}','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(OUT/'goal.mp4')])
    record('goal',slug,overrides,[w,h],durationSeconds=4.8,crop=clip,events='Eight unique follower events, 42/50 to 50/50')

async def render_scene(browser,name,slug):
    overrides={'streamerName':'RetroStreamer','showClock':'off','progressSeconds':6}
    context,page,folder,errors=await new_capture(browser,name,slug,'scene',(960,540),overrides,video=True)
    await page.wait_for_timeout(1000)
    raw=await page.screenshot(omit_background=True)
    image=Image.open(io.BytesIO(raw));image.save(OUT/f'{name}.png');image.save(OUT/f'{name}.webp',lossless=True)
    await page.wait_for_timeout(6300)
    path=await page.video.path()
    await context.close()
    if errors:raise RuntimeError(errors)
    run_ffmpeg(['-i',str(path),'-ss','1','-t','6','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(OUT/f'{name}.mp4')])
    record(name,slug,overrides,[960,540],durationSeconds=6)

async def render_frame(browser):
    slug='sku-mk-07-game-frame';overrides={'windowTitle':'Arcade.exe','showClock':'off','statusText':'Running...'}
    context,page,folder,errors=await new_capture(browser,'frame',slug,'overlay',(960,540),overrides)
    raw=await page.screenshot(omit_background=True)
    image=Image.open(io.BytesIO(raw));image.save(OUT/'frame.png');image.save(OUT/'frame.webp',lossless=True)
    await context.close()
    if errors:raise RuntimeError(errors)
    record('frame',slug,overrides,[960,540])

async def main():
    args=argparse.ArgumentParser();args.add_argument('--only',default='');chosen=args.parse_args().only.split(',')
    async with async_playwright() as playwright:
        browser=await playwright.chromium.launch()
        jobs=[('chat',lambda:render_chat(browser)),
              ('follow',lambda:render_alert(browser,'follow','follower-latest','PixelPal')),
              ('subscriber',lambda:render_alert(browser,'subscriber','subscriber-latest','RetroFan42',amount=1,tier='1000')),
              ('raid',lambda:render_alert(browser,'raid','raid-latest','CozyCrew',amount=42)),
              ('goal',lambda:render_goal(browser)),
              ('starting',lambda:render_scene(browser,'starting','sku-mk-02-starting-soon')),
              ('brb',lambda:render_scene(browser,'brb','sku-mk-03-brb-scene')),
              ('ending',lambda:render_scene(browser,'ending','sku-mk-04-ending-scene')),
              ('frame',lambda:render_frame(browser))]
        for name,job in jobs:
            if chosen!=[''] and name not in chosen:continue
            await job()
        await browser.close()
    print('All requested actual-widget media generated. Product sources unchanged.',flush=True)

if __name__=='__main__':asyncio.run(main())
