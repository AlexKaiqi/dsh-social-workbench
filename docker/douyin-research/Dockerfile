FROM python:3.12-bookworm

ARG MEDIACRAWLER_COMMIT=d6f7c5bb906b6dac40ddf343ef9e26438a3de092
ARG UV_VERSION=0.8.12
ARG FASTER_WHISPER_VERSION=1.2.1

ENV DEBIAN_FRONTEND=noninteractive \
    DISPLAY=:99 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    PYTHONUNBUFFERED=1 \
    HF_HOME=/state/huggingface

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      build-essential ca-certificates git novnc openbox procps python3.11-dev \
      websockify x11vnc xvfb \
      fonts-noto-cjk fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*

RUN python -m pip install --disable-pip-version-check --no-cache-dir "uv==${UV_VERSION}"

RUN git clone --filter=blob:none --no-checkout https://github.com/NanmiCoder/MediaCrawler.git /opt/MediaCrawler \
    && git -C /opt/MediaCrawler fetch --depth 1 origin "${MEDIACRAWLER_COMMIT}" \
    && git -C /opt/MediaCrawler checkout --detach "${MEDIACRAWLER_COMMIT}" \
    && test "$(git -C /opt/MediaCrawler rev-parse HEAD)" = "${MEDIACRAWLER_COMMIT}"

WORKDIR /opt/MediaCrawler
RUN uv sync --frozen \
    && uv pip install --python .venv/bin/python "faster-whisper==${FASTER_WHISPER_VERSION}" \
    && .venv/bin/python -m playwright install --with-deps chromium \
    && rm -rf /root/.cache/pip /root/.cache/uv

COPY scripts/mediacrawler-entry.py /opt/dsh/mediacrawler-entry.py
COPY scripts/transcribe-local-media.py /opt/dsh/transcribe-local-media.py
COPY docker/douyin-research/entrypoint.sh /opt/dsh/entrypoint.sh
RUN chmod 0755 /opt/dsh/entrypoint.sh /opt/dsh/*.py \
    && mkdir -p /state /artifacts /ms-playwright

EXPOSE 7900
ENTRYPOINT ["/opt/dsh/entrypoint.sh"]
