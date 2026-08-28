#!/usr/bin/env python3
"""Transcribe one already-downloaded local media file with faster-whisper."""

import argparse
import json
import os
import pathlib


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--model", default="small")
    parser.add_argument("--language", default="zh")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    input_path = pathlib.Path(args.input).resolve(strict=True)
    output_path = pathlib.Path(args.output).resolve()
    if not input_path.is_file():
        raise RuntimeError("input is not a regular file")
    output_path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)

    from faster_whisper import WhisperModel

    model = WhisperModel(args.model, device="cpu", compute_type="int8")
    segments_iterator, info = model.transcribe(
        str(input_path),
        language=args.language,
        vad_filter=True,
    )
    segments = [
        {"start": segment.start, "end": segment.end, "text": segment.text.strip()}
        for segment in segments_iterator
        if segment.text.strip()
    ]
    result = {
        "language": info.language,
        "languageProbability": info.language_probability,
        "text": "".join(segment["text"] for segment in segments),
        "segments": segments,
    }
    descriptor = os.open(output_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
        json.dump(result, handle, ensure_ascii=False)
        handle.write("\n")


if __name__ == "__main__":
    main()
