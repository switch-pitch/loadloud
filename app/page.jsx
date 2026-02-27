"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const PHONE = "+1 310-844-6763";
const VIDEO_ITEMS = [
  {
    playbackId: "vC7dTAmd8s02RWzK9rfoDJGhQD2O9KJIsELnq93QeRmM",
    title: "«Больше не поймаешь», Rozalia",
    caption:
      "Масштаб, трюки с бенозопилой и много любви — всё это наш клип для певицы Розалии, вдохновленный культовыми фильмами 2000-х."
  },
  {
    playbackId: "vC7dTAmd8s02RWzK9rfoDJGhQD2O9KJIsELnq93QeRmM",
    title: "Осенняя коллекция lusavou",
    caption:
      "Красивая и уютная сказка, в которой бренд прощается с летом и представляет свою осеннюю коллекцию."
  },
  {
    playbackId: "vC7dTAmd8s02RWzK9rfoDJGhQD2O9KJIsELnq93QeRmM",
    title: "Chromnesia (ролик 1)",
    caption:
      "Сюреалистичная история про поиск дома — короткометражный фильм, вместе с белорусским визионером Acid Topser. Кроме съёмок фильма, мы подготовили промо и выпустили совместные мерч-боксы."
  },
  {
    playbackId: "vC7dTAmd8s02RWzK9rfoDJGhQD2O9KJIsELnq93QeRmM",
    title: "Chromnesia (ролик 2)",
    caption:
      "Сюреалистичная история про поиск дома — короткометражный фильм, вместе с белорусским визионером Acid Topser. Кроме съёмок фильма, мы подготовили промо и выпустили совместные мерч-боксы."
  }
];

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android|Mobile|BlackBerry|IEMobile|Silk/i.test(navigator.userAgent || "");
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const total = Math.floor(seconds);
  const mins = String(Math.floor(total / 60)).padStart(2, "0");
  const secs = String(total % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

export default function Page() {
  const playerRef = useRef(null);
  const controlsRef = useRef(null);
  const hideTimerRef = useRef(null);

  const [mode, setMode] = useState("dark");
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [hideUI, setHideUI] = useState(false);
  const [pseudoFullscreen, setPseudoFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startVisible, setStartVisible] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLandscapeMobile, setIsLandscapeMobile] = useState(false);
  const [frameStyle, setFrameStyle] = useState({});
  const [formState, setFormState] = useState({ status: "idle", message: "" });

  const currentVideo = useMemo(() => VIDEO_ITEMS[currentVideoIndex], [currentVideoIndex]);
  const phoneVisible = currentTime >= 151 && !hasEnded;
  const canControlPlayer = useCallback((player) => {
    return Boolean(player && typeof player.play === "function" && typeof player.pause === "function");
  }, []);

  const safePause = useCallback(
    (player) => {
      if (canControlPlayer(player)) player.pause();
    },
    [canControlPlayer]
  );

  const safePlay = useCallback(
    (player) => {
      if (canControlPlayer(player)) player.play();
    },
    [canControlPlayer]
  );

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const resetHideTimer = useCallback(() => {
    if (infoOpen) return;
    setHideUI(false);
    clearHideTimer();
    if (!isPlaying) return;

    hideTimerRef.current = window.setTimeout(() => {
      const hovered = controlsRef.current ? controlsRef.current.matches(":hover") : false;
      if (!hovered) setHideUI(true);
    }, 2000);
  }, [clearHideTimer, infoOpen, isPlaying]);

  const updateLayout = useCallback(() => {
    if (typeof window === "undefined") return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const landscape = vw > vh && vw <= 768;
    setIsLandscapeMobile(landscape);

    if (pseudoFullscreen) {
      setFrameStyle({});
      return;
    }

    let width = vw;
    let height = width / (4 / 3);
    if (height > vh) {
      height = vh - 72;
      width = height * (4 / 3);
    }

    const limited = Math.min(width, vw <= 640 && vh > vw ? vw : 640);
    const scale = limited / 640;
    setFrameStyle({
      width: `${640 * scale}px`,
      height: `${480 * scale}px`
    });
  }, [pseudoFullscreen]);

  useEffect(() => {
    const saved = window.localStorage.getItem("project3-theme");
    if (saved === "light" || saved === "dark") setMode(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("project3-theme", mode);
  }, [mode]);

  useEffect(() => {
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [updateLayout]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onPlay = () => {
      setIsPlaying(true);
      setHasEnded(false);
      setStartVisible(false);
      resetHideTimer();
    };

    const onPause = () => {
      setIsPlaying(false);
      setHideUI(false);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setHasEnded(true);
      setHideUI(false);
    };

    const onLoadedMetadata = () => {
      setDuration(Number(player.duration) || 0);
    };

    const onTimeUpdate = () => {
      setCurrentTime(Number(player.currentTime) || 0);
    };

    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    player.addEventListener("ended", onEnded);
    player.addEventListener("loadedmetadata", onLoadedMetadata);
    player.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("ended", onEnded);
      player.removeEventListener("loadedmetadata", onLoadedMetadata);
      player.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [resetHideTimer]);

  useEffect(() => {
    const onFullScreenChange = () => {
      const player = playerRef.current;
      setPseudoFullscreen(Boolean(document.fullscreenElement && document.fullscreenElement === player));
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape" && !isMobileDevice() && !document.fullscreenElement) {
        setPseudoFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", onFullScreenChange);
    window.addEventListener("keydown", onKeyDown);
    ["mousemove", "touchstart", "resize", "orientationchange"].forEach((name) => {
      window.addEventListener(name, resetHideTimer, { passive: true });
    });

    return () => {
      document.removeEventListener("fullscreenchange", onFullScreenChange);
      window.removeEventListener("keydown", onKeyDown);
      ["mousemove", "touchstart", "resize", "orientationchange"].forEach((name) => {
        window.removeEventListener(name, resetHideTimer);
      });
    };
  }, [resetHideTimer]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    safePause(player);
    if ("currentTime" in player) player.currentTime = 0;
    setIsPlaying(false);
    setHasEnded(false);
    setStartVisible(true);
    setCurrentTime(0);
    setDuration(0);
    setHideUI(false);
    clearHideTimer();
  }, [clearHideTimer, currentVideo, safePause]);

  useEffect(() => {
    if (!isPlaying || infoOpen) {
      setHideUI(false);
      clearHideTimer();
      return;
    }

    resetHideTimer();
    return clearHideTimer;
  }, [clearHideTimer, infoOpen, isPlaying, resetHideTimer]);

  const togglePlay = () => {
    const player = playerRef.current;
    if (!player) return;
    if (!canControlPlayer(player)) return;

    if (player.paused) safePlay(player);
    else safePause(player);
  };

  const toggleInfo = () => {
    setInfoOpen((prev) => {
      const next = !prev;
      if (next && isPlaying && playerRef.current) {
        safePause(playerRef.current);
      }
      if (next) setHideUI(false);
      return next;
    });
  };

  const toggleFullscreen = () => {
    const player = playerRef.current;
    if (!player) return;

    if (isMobileDevice()) {
      if (!document.fullscreenElement && player.requestFullscreen) {
        player.requestFullscreen().catch(() => {});
      } else if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      return;
    }

    setPseudoFullscreen((prev) => !prev);
  };

  const changeVideo = (step) => {
    setCurrentVideoIndex((prev) => (prev + step + VIDEO_ITEMS.length) % VIDEO_ITEMS.length);
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setFormState({ status: "submitting", message: "Отправляем..." });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Не удалось отправить форму");
      }

      if (data?.mode === "email") {
        setFormState({ status: "success", message: "Спасибо! Заявка отправлена на почту." });
      } else {
        setFormState({
          status: "success",
          message: "Форма принята (режим заглушки). Завтра подключим боевую почту."
        });
      }

      form.reset();
    } catch (error) {
      setFormState({
        status: "error",
        message: error instanceof Error ? error.message : "Ошибка отправки. Попробуйте снова."
      });
    }
  };

  const frameClasses = [
    "frame",
    isLandscapeMobile && !pseudoFullscreen ? "landscape-mobile" : "",
    pseudoFullscreen ? "is-fullscreen" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const appClasses = ["app", infoOpen ? "info-open" : "", hideUI ? "hide-ui" : ""].filter(Boolean).join(" ");

  return (
    <div className={appClasses} data-mode={mode}>
      <section className="brand-block ignore-hide-ui" aria-label="Brand description">
        <h1 className="brand-title">loadloud studio</h1>
      </section>

      <button className="ui-button top-right ignore-hide-ui" type="button" onClick={toggleInfo}>
        {infoOpen ? "закрыть" : "нажать здесь"}
      </button>

      <main className={frameClasses} style={frameStyle}>
        <button
          className="side-arrow side-arrow-left ignore-hide-ui"
          type="button"
          aria-label="Previous video"
          onClick={() => changeVideo(-1)}
        >
          &lt;
        </button>
        <button
          className="side-arrow side-arrow-right ignore-hide-ui"
          type="button"
          aria-label="Next video"
          onClick={() => changeVideo(1)}
        >
          &gt;
        </button>

        <button className="start-button ignore-hide-ui" type="button" hidden={!startVisible} onClick={togglePlay}>
          Play
        </button>

        <mux-player
          ref={playerRef}
          className="player ignore-hide-ui"
          playsinline=""
          preload="metadata"
          stream-type="on-demand"
          playback-id={currentVideo.playbackId}
          poster={`https://image.mux.com/${currentVideo.playbackId}/thumbnail.png?time=0`}
          aria-label="loadloud video"
          muted={isMuted}
        />

        <div className="tap-layer ignore-hide-ui" aria-hidden="true" onClick={togglePlay} />

        <div className="phone-overlay ignore-hide-ui" hidden={!phoneVisible}>
          <a className="phone-link" href={`tel:${PHONE.replace(/\s+/g, "")}`} aria-label="Call phone number" />
        </div>

        <div ref={controlsRef} className="controls ignore-hide-ui">
          <div className="controls-row">
            <div className="controls-left">
              <button className="ui-button" type="button" onClick={togglePlay}>
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button className="ui-button ui-time" type="button" onClick={togglePlay}>
                {formatTime(currentTime)}/{formatTime(duration)}
              </button>
            </div>
            <div className="controls-right">
              <button
                className={`ui-button ${isMuted ? "muted-line" : ""}`}
                type="button"
                onClick={() => setIsMuted((prev) => !prev)}
              >
                Mute
              </button>
              <button className="ui-button" type="button" onClick={toggleFullscreen}>
                {pseudoFullscreen ? "Exit" : "Fullscreen"}
              </button>
            </div>
          </div>
        </div>

        <p className="frame-caption ignore-hide-ui">
          <span className="caption-title">{currentVideo.title}</span>
          {currentVideo.caption}
        </p>
      </main>

      <section className="info-panel" hidden={!infoOpen}>
        <div className="info-content">
          <p className="contact-intro">
            loadloud studio - продакшн полного цикла.
            <br />
            снимаем бренд-контент, клипы, фильмы и пишем креатив к ним сами.
            <br />
            не волнуйтесь, мы это очень любим!
          </p>

          <h2 className="contact-title">расскажите нам о вашей задаче</h2>

          <form className="contact-form" onSubmit={handleContactSubmit}>
            <div className="form-grid">
              <label className="field">
                <span>Имя*</span>
                <input type="text" name="name" required />
              </label>

              <label className="field">
                <span>Компания*</span>
                <input type="text" name="company" required />
              </label>

              <label className="field">
                <span>Телефон*</span>
                <input type="tel" name="phone" required />
              </label>

              <label className="field">
                <span>E-mail*</span>
                <input type="email" name="email" required />
              </label>
            </div>

            <label className="field field-file">
              <span>Прикрепить файл</span>
              <input type="file" name="file" />
            </label>

            <label className="field field-area">
              <span>Описание задачи</span>
              <textarea name="message" rows={4} />
            </label>

            <div className="form-actions">
              <label className="consent">
                <input type="checkbox" name="consent" required />
                <span>Я согласен с правилами обработки персональных данных</span>
              </label>

              <button className="send-button" type="submit" disabled={formState.status === "submitting"}>
                {formState.status === "submitting" ? "Отправка..." : "Отправить →"}
              </button>
            </div>

            {formState.message ? (
              <p className={`form-status ${formState.status === "error" ? "is-error" : "is-success"}`}>
                {formState.message}
              </p>
            ) : null}
          </form>
        </div>
      </section>

      <button
        className="theme-dot ignore-hide-ui"
        type="button"
        aria-label="Переключить тему"
        onClick={() => setMode((prev) => (prev === "dark" ? "light" : "dark"))}
      >
        <span className="dot" />
      </button>
    </div>
  );
}
