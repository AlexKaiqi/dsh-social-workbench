#!/usr/bin/env python3
"""Safety wrapper for the optional local MediaCrawler research sidecar."""

import os
import pathlib
import sys


def main() -> None:
    sidecar_root_value = os.environ.get("DSH_SOCIAL_MEDIACRAWLER_ROOT", "")
    profile_root_value = os.environ.get("DSH_SOCIAL_BROWSER_PROFILE_ROOT", "")
    if not sidecar_root_value or not profile_root_value:
        raise RuntimeError("DSH_SOCIAL_MEDIACRAWLER_ROOT and DSH_SOCIAL_BROWSER_PROFILE_ROOT are required")
    sidecar_root = pathlib.Path(sidecar_root_value).expanduser().resolve(strict=True)
    if not (sidecar_root / "main.py").is_file():
        raise RuntimeError("MediaCrawler main.py is missing")
    profile_root = pathlib.Path(profile_root_value).expanduser().resolve()
    if not profile_root.is_absolute():
        raise RuntimeError("browser profile root must be absolute")
    if "--cookies" in sys.argv or any(value == "cookie" for value in sys.argv):
        raise RuntimeError("cookie-string login is disabled; use the dedicated QR browser profile")

    sys.path.insert(0, str(sidecar_root))
    os.chdir(sidecar_root)

    import config

    config.ENABLE_CDP_MODE = False
    config.CDP_CONNECT_EXISTING = False
    config.SAVE_LOGIN_STATE = True
    config.USER_DATA_DIR = str(profile_root / "%s_user_data_dir")
    config.COOKIES = ""
    config.ENABLE_GET_MEIDAS = os.environ.get("DSH_SOCIAL_ENABLE_MEDIA") == "1"
    config.ENABLE_GET_WORDCLOUD = False
    config.DISABLE_SSL_VERIFY = False

    # Douyin keeps long-lived resources open, so waiting for the browser's
    # full `load` event can time out even when the app shell is usable. Keep
    # MediaCrawler's navigation targets, but use the stable SPA readiness
    # boundary and a bounded timeout for every Playwright page navigation.
    from playwright.async_api import Page

    original_page_goto = Page.goto

    async def goto_douyin_spa(self, url, **kwargs):
        kwargs.setdefault("wait_until", "domcontentloaded")
        kwargs.setdefault("timeout", 60_000)
        return await original_page_goto(self, url, **kwargs)

    Page.goto = goto_douyin_spa

    search_limit_value = os.environ.get("DSH_SOCIAL_SEARCH_LIMIT", "")
    if search_limit_value:
        search_limit = int(search_limit_value)
        if search_limit < 1 or search_limit > 50:
            raise RuntimeError("DSH_SOCIAL_SEARCH_LIMIT must be between 1 and 50")

        from media_platform.douyin.client import DouYinClient

        original_search = DouYinClient.search_info_by_keyword

        async def bounded_search(self, *args, **kwargs):
            result = await original_search(self, *args, **kwargs)
            data = result.get("data") if isinstance(result, dict) else None
            if isinstance(data, list) and len(data) > search_limit:
                result = dict(result)
                result["data"] = data[:search_limit]
            return result

        DouYinClient.search_info_by_keyword = bounded_search

    # MediaCrawler always continues into a crawler mode after authentication.
    # For the dedicated login command, replace the parsed crawl target with an
    # empty detail run so a successful login cannot enumerate creator content.
    if os.environ.get("DSH_SOCIAL_LOGIN_ONLY") == "1":
        import cmd_arg

        original_parse_cmd = cmd_arg.parse_cmd

        async def parse_login_only_cmd():
            args = await original_parse_cmd()
            config.CRAWLER_TYPE = "detail"
            config.DY_SPECIFIED_ID_LIST = []
            config.ENABLE_GET_COMMENTS = False
            config.ENABLE_GET_SUB_COMMENTS = False
            config.ENABLE_GET_MEIDAS = False
            return args

        cmd_arg.parse_cmd = parse_login_only_cmd

    import main as mediacrawler

    from tools.app_runner import run

    run(
        mediacrawler.main,
        mediacrawler.async_cleanup,
        cleanup_timeout_seconds=15.0,
    )


if __name__ == "__main__":
    main()
