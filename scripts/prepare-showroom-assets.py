"""Render public demo media from existing product sources; never ship widget source.

Run from the product repo with .venv/Scripts/python LandingPage/scripts/prepare-showroom-assets.py.
Private harnesses stay in ignored .preview; public output contains images/video only.
"""
import asyncio
import hashlib
import json
from pathlib import Path
import subprocess
import sys

SITE = Path(__file__).resolve().parents[1]
ROOT = SITE.parent
sys.path.insert(0, str(ROOT / "tools"))
import pin_video
from pin_video import build_member_harness, find_ffmpeg
from PIL import Image
from playwright.async_api import async_playwright

OUT = SITE / "public" / "showroom" / "messenger"
WORK = SITE / ".preview" / "renders"
OUT.mkdir(parents=True, exist_ok=True)
WORK.mkdir(parents=True, exist_ok=True)
pin_video.CHAT_LINES = [
    ('PixelPal', 'hey everyone!'), ('CozyCrew', 'one more quest?'),
    ('NightOwl', 'always one more'), ('PixelPal', 'glad you are here'),
    ('CozyCrew', 'the sunset is so cozy'), ('NightOwl', 'snacks acquired'),
    ('PixelPal', 'okay, who has the map?'), ('CozyCrew', '...we had a map?'),
]

async def main():
    specs = [
        ("chat", "sku-legacy-17-retro-messenger", "chat", 600, 680,
         {"windowTitle": "Your stream - Instant Message", "warningName": "Your stream", "fontSize": 15, "namesSize": 15,
          "enable7tv": "off", "enableBttv": "off", "enableFfz": "off", "alertsEnabled": "off"}, 2.7),
        ("alert", "sku-mk-01-alert-popups", "alert", 720, 180, {"holdSeconds": 20, "fontSize": 18, "soundEnabled": "off"}, 1.2),
        ("frame", "sku-mk-07-game-frame", "overlay", 800, 590, {"windowTitle": "OneMoreQuest.exe", "showClock": "off", "statusText": "Your gameplay goes here"}, 0.3),
        ("goal", "sku-mk-05-goal-bars", "goal", 800, 150, {}, 0.3),
        ("starting", "sku-mk-02-starting-soon", "scene", 1280, 720, {}, 1.0),
        ("brb", "sku-mk-03-brb-scene", "scene", 1280, 720, {}, 1.0),
        ("ending", "sku-mk-04-ending-scene", "scene", 1280, 720, {}, 1.0),
    ]
    manifest = {"purpose": "Local showroom preview. Actual product renders with fictional demo messages.", "assets": []}
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for name, slug, kind, width, height, overrides, delay in specs:
            file = build_member_harness(slug, kind, WORK, kick_delay_ms=200, overrides=overrides)
            if not file:
                raise RuntimeError(f"Missing source: {slug}")
            opts = {"viewport": {"width": width, "height": height}, "device_scale_factor": 1}
            if name == "chat":
                opts.update(record_video_dir=str(WORK / "video"), record_video_size={"width": width, "height": height})
            context = await browser.new_context(**opts)
            await context.add_init_script("window.WebFont={load:function(){}};")
            await context.route("http**://**", lambda route: route.abort())
            page = await context.new_page()
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            await page.goto((WORK / file).as_uri())
            await page.wait_for_timeout(delay * 1000)
            await page.screenshot(path=str(OUT / f"{name}.png"), omit_background=True)
            if name == "chat":
                await page.wait_for_timeout(1500)
                for i, (who, message) in enumerate([
                    ("PixelPal", "anyone else hear the sign-on sound?"),
                    ("CozyCrew", "one more quest, then bed"),
                    ("NightOwl", "we said that three quests ago"),
                    ("PixelPal", "this is my kind of group chat"),
                ]):
                    await page.evaluate("([who,text,i])=>window.dispatchEvent(new CustomEvent('onEventReceived',{detail:{listener:'message',event:{data:{displayName:who,nick:who,userId:'demo-'+who,msgId:'extra-'+i,text,sanitized:'',badges:[],emotes:[]}}}}))", [who, message, i])
                    await page.wait_for_timeout(2000)
                video_path = await page.video.path()
            await context.close()
            if errors:
                raise RuntimeError(f"{slug}: {errors}")
            if name == "chat":
                subprocess.run([find_ffmpeg(), "-y", "-i", str(video_path), "-ss", "3.0", "-t", "9", "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "23", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(OUT / "chat.mp4")], check=True, capture_output=True)
            with Image.open(OUT / f"{name}.png") as img:
                if name in ('alert', 'goal'):
                    img = img.crop(img.getbbox())
                img.save(OUT / f"{name}.webp", lossless=True)
            manifest["assets"].append({"name": name, "sourceSlug": slug, "overrides": overrides,
                "sourceHash": hashlib.sha256(b"".join((ROOT / "widgets" / slug / "streamelements" / f).read_bytes() for f in ["html.txt", "css.txt", "js.txt", "data.txt"])).hexdigest()})
        await browser.close()
    # Existing listing previews are catalog pictures, not the transformation media.
    for family, slug in [("messenger", "sku-mk-kit-full"), ("win95", "sku-w95-kit-full"), ("xp", "sku-xp-kit-full")]:
        src = ROOT / "widgets" / slug / "etsy" / "images" / "hero.png"
        if not src.exists():
            candidates = list((SITE / "public" / "images" / slug).glob("*.png"))
            src = candidates[0] if candidates else src
        with Image.open(src) as img:
            img.thumbnail((1000, 750))
            img.convert("RGB").save(OUT.parent / f"{family}-kit.webp", quality=86)
    (WORK / "asset-provenance.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print("Rendered Messenger showroom images and chat.mp4; product sources unchanged.")

asyncio.run(main())
