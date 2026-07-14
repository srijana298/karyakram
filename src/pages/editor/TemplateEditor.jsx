import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { certificateService } from "../../services/certificates";
import {
  IoArrowBackOutline,
  IoArrowRedoOutline,
  IoArrowUndoOutline,
  IoCloudUploadOutline,
  IoEyeOutline,
  IoTextOutline,
  IoTrashOutline,
  IoAddOutline,
  IoRemoveOutline,
} from "../../components/icons";
import { MdFormatBold, MdFormatItalic } from "../../components/icons";
import Loading from "../../components/Loading";

const FONTS = [
  "Inter",
  "Georgia",
  "Playfair Display",
  "Montserrat",
  "Dancing Script",
  "Oswald",
  "Merriweather",
  "Raleway",
  "Lora",
  "Poppins",
  "Roboto Slab",
  "Space Grotesk",
];

const FONT_SIZES = [16, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 84, 96];

/* ── Text Object Model ─────────────────────────────────────── */
function createTextObject(opts = {}) {
  return {
    id: Date.now() + Math.random(),
    type: "text",
    text: opts.text || "",
    x: opts.x || 0,
    y: opts.y || 0,
    width: opts.width || 400,
    height: 0, // computed during render
    fontSize: opts.fontSize || 48,
    fontFamily: opts.fontFamily || "Inter",
    fill: opts.fill || "#000000",
    fontWeight: opts.fontWeight || "normal",
    fontStyle: opts.fontStyle || "normal",
    textAlign: opts.textAlign || "center",
    angle: opts.angle || 0,
    role: opts.role || null,
    autoWidth: opts.autoWidth ?? true,
    paddingX: opts.paddingX ?? 12,
    paddingY: opts.paddingY ?? 8,
  };
}

/* ── Main Component ─────────────────────────────────────────── */
export default function TemplateEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const ctxRef = useRef(null);
  const bgImageRef = useRef(null);
  const objectsRef = useRef([]);
  const selectedIdRef = useRef(null);
  const dragStateRef = useRef(null);
  const animFrameRef = useRef(null);

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [backgroundPreview, setBackgroundPreview] = useState(null);
  const [canvasWidth, setCanvasWidth] = useState(1400);
  const [canvasHeight, setCanvasHeight] = useState(1000);
  const [renderTick, setRenderTick] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);

  // Selected object properties
  const [selected, setSelected] = useState(null);
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState("Inter");
  const [textColor, setTextColor] = useState("#000000");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState("center");

  // History for undo/redo
  const historyRef = useRef([]);
  const historyIdxRef = useRef(-1);
  const skipHistoryRef = useRef(false);



  /* ── Load template if editing ───────────────────────── */
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    (async () => {
      const res = await certificateService.getTemplate(id);
      if (!res.ok) {
        toast.error(res.error || "Template not found");
        navigate(-1);
        return;
      }
      const t = res.data;
      setTemplateName(t.name || "");
      setCanvasWidth(t.canvas_width || 1400);
      setCanvasHeight(t.canvas_height || 1000);
      if (t.background_url) setBackgroundPreview(t.background_url);
      if (t.canvas_json) {
        try {
          const json = typeof t.canvas_json === "string" ? JSON.parse(t.canvas_json) : t.canvas_json;
          if (json.objects) {
            objectsRef.current = json.objects.map((o) => createTextObject(o));
          }
        } catch (e) {
          console.error("Failed to parse canvas_json:", e);
        }
      }
      setLoading(false);
    })();
  }, [id, navigate]);

  /* ── Canvas context + fit ───────────────────────────── */
  const fitCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;

    // Canvas internal resolution = image dimensions exactly
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // CSS display: scale down to fit viewport if needed
    const availW = container.clientWidth - 48;
    const availH = window.innerHeight - 56 - 48;
    if (availW > 0 && availH > 0) {
      const scale = Math.min(availW / canvasWidth, availH / canvasHeight, 1);
      canvas.style.width = Math.round(canvasWidth * scale) + "px";
      canvas.style.height = Math.round(canvasHeight * scale) + "px";
    }
  }, [canvasWidth, canvasHeight]);

  /* ── Render loop ────────────────────────────────────── */
  const render = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const cw = canvasWidth;
    const ch = canvasHeight;

    // Clear
    ctx.clearRect(0, 0, cw, ch);

    // Background color
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, cw, ch);

    // Background image — 1:1, canvas = image size
    const bgImg = bgImageRef.current;
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, cw, ch);
    }

    // Objects
    for (const obj of objectsRef.current) {
      ctx.save();
      ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
      ctx.rotate((obj.angle * Math.PI) / 180);

      // Measure text to compute height
      const weight = obj.fontWeight === "bold" ? "bold" : "normal";
      const style = obj.fontStyle === "italic" ? "italic" : "normal";
      ctx.font = `${style} ${weight} ${obj.fontSize}px "${obj.fontFamily}"`;
      ctx.fillStyle = obj.fill;
      ctx.textAlign = obj.textAlign;
      ctx.textBaseline = "middle";

      const lineHeight = obj.fontSize * 1.3;

      // Auto-size to text by default
      if (obj.autoWidth) {
        const rawLines = (obj.text || "").split("\n");
        const longest = rawLines.reduce((m, l) => Math.max(m, ctx.measureText(l || " ").width), 0);
        obj.width = Math.max(40, Math.ceil(longest + (obj.paddingX || 0) * 2));
        obj.height = Math.max(lineHeight, Math.ceil(rawLines.length * lineHeight + (obj.paddingY || 0) * 2));
      }

      // Word-wrap only when manually resized
      const lines = obj.autoWidth ? (obj.text || "").split("\n") : wrapText(ctx, obj.text, obj.width);
      const totalHeight = obj.autoWidth
        ? Math.max(lineHeight, Math.ceil(lines.length * lineHeight + (obj.paddingY || 0) * 2))
        : lines.length * lineHeight;
      obj.height = totalHeight;

      const textX = 0; // already translated to center
      const textY = -(totalHeight / 2) + lineHeight / 2 + (obj.autoWidth ? (obj.paddingY || 0) : 0);

      for (let i = 0; i < lines.length; i++) {
        let lx = textX;
        if (obj.textAlign === "left") lx = -obj.width / 2;
        else if (obj.textAlign === "right") lx = obj.width / 2;
        ctx.fillText(lines[i], lx, textY + i * lineHeight);
      }

      // Selection outline + controllers
      if (obj.id === selectedIdRef.current) {
        ctx.strokeStyle = "#059669";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(-obj.width / 2, -totalHeight / 2, obj.width, totalHeight);
        ctx.setLineDash([]);

        // Edge/corner resize handles
        const hs = 8;
        ctx.fillStyle = "#059669";
        const hw = obj.width / 2;
        const hh = totalHeight / 2;
        const handles = [
          [-hw, -hh], [0, -hh], [hw, -hh],
          [-hw, 0],             [hw, 0],
          [-hw, hh],  [0, hh],  [hw, hh],
        ];
        for (const [cx, cy] of handles) {
          ctx.fillRect(cx - hs / 2, cy - hs / 2, hs, hs);
        }

        // Rotate handle (top center)
        const handleY = -totalHeight / 2 - 30;
        ctx.strokeStyle = "#059669";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -totalHeight / 2);
        ctx.lineTo(0, handleY + 8);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(0, handleY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#059669";
        ctx.stroke();
      }

      ctx.restore();
    }
  }, [canvasWidth, canvasHeight]);

  // Word-wrap helper
  function wrapText(ctx, text, maxWidth) {
    if (!text) return [""];
    const paragraphs = text.split("\n");
    const lines = [];
    for (const para of paragraphs) {
      const words = para.split(" ");
      let currentLine = "";
      for (const word of words) {
        const test = currentLine ? currentLine + " " + word : word;
        if (ctx.measureText(test).width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = test;
        }
      }
      lines.push(currentLine);
    }
    return lines;
  }

  /* ── Schedule render ────────────────────────────────── */
  const scheduleRender = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      render();
    });
  }, [render]);

  // Re-render on tick changes
  useEffect(() => {
    scheduleRender();
  }, [renderTick, scheduleRender]);

  /* ── Initialize canvas ──────────────────────────────── */
  useEffect(() => {
    if (loading) return;

    fitCanvas();

    // Load background if available
    if (backgroundPreview) {
      loadBackgroundImage(backgroundPreview);
    }

    // Initial history
    saveHistory();

    const handleResize = () => {
      fitCanvas();
      scheduleRender();
    };
    window.addEventListener("resize", handleResize);

    const container = containerRef.current;
    const ro = container ? new ResizeObserver(() => handleResize()) : null;
    if (container && ro) ro.observe(container);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (ro) ro.disconnect();
    };
  }, [loading, fitCanvas, scheduleRender]);

  // Re-fit when canvas dimensions change
  useEffect(() => {
    if (!loading) {
      fitCanvas();
      scheduleRender();
    }
  }, [canvasWidth, canvasHeight, loading, fitCanvas, scheduleRender]);

  /* ── Load background image ──────────────────────────── */
  const loadBackgroundImage = (url) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      bgImageRef.current = img;
      scheduleRender();
    };
    img.onerror = (err) => {
      console.error("Failed to load background:", err);
    };
    img.src = url;
  };

  /* ── Hit testing ────────────────────────────────────── */
  const toLocalPoint = (obj, px, py) => {
    const cx = obj.x + obj.width / 2;
    const cy = obj.y + obj.height / 2;
    const dx = px - cx;
    const dy = py - cy;
    const rad = -(obj.angle * Math.PI) / 180;
    return {
      x: dx * Math.cos(rad) - dy * Math.sin(rad),
      y: dx * Math.sin(rad) + dy * Math.cos(rad),
    };
  };

  const hitTest = (px, py) => {
    for (let i = objectsRef.current.length - 1; i >= 0; i--) {
      const obj = objectsRef.current[i];
      const local = toLocalPoint(obj, px, py);
      if (
        local.x >= -obj.width / 2 &&
        local.x <= obj.width / 2 &&
        local.y >= -obj.height / 2 &&
        local.y <= obj.height / 2
      ) {
        return obj;
      }
    }
    return null;
  };

  const getControlHit = (obj, px, py) => {
    const local = toLocalPoint(obj, px, py);
    const hw = obj.width / 2;
    const hh = obj.height / 2;
    const hs = 10;

    const rotateHandle = { x: 0, y: -hh - 30, r: 12 };
    const dist = Math.hypot(local.x - rotateHandle.x, local.y - rotateHandle.y);
    if (dist <= rotateHandle.r) return "rotate";

    const handleMap = [
      { key: "nw", x: -hw, y: -hh },
      { key: "n", x: 0, y: -hh },
      { key: "ne", x: hw, y: -hh },
      { key: "w", x: -hw, y: 0 },
      { key: "e", x: hw, y: 0 },
      { key: "sw", x: -hw, y: hh },
      { key: "s", x: 0, y: hh },
      { key: "se", x: hw, y: hh },
    ];

    for (const h of handleMap) {
      if (Math.abs(local.x - h.x) <= hs && Math.abs(local.y - h.y) <= hs) return `resize-${h.key}`;
    }

    if (local.x >= -hw && local.x <= hw && local.y >= -hh && local.y <= hh) return "move";

    return null;
  };

  /* ── Convert mouse event to canvas coords ───────────── */
  const eventToCanvas = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  /* ── Mouse handlers ─────────────────────────────────── */
  const handleMouseDown = (e) => {
    const pos = eventToCanvas(e);

    // Priority: selected object's controllers
    const selectedObj = objectsRef.current.find((o) => o.id === selectedIdRef.current);
    if (selectedObj) {
      const control = getControlHit(selectedObj, pos.x, pos.y);
      if (control === "rotate") {
        const cx = selectedObj.x + selectedObj.width / 2;
        const cy = selectedObj.y + selectedObj.height / 2;
        dragStateRef.current = {
          mode: "rotate",
          objId: selectedObj.id,
          centerX: cx,
          centerY: cy,
          startPointerAngle: Math.atan2(pos.y - cy, pos.x - cx),
          origAngle: selectedObj.angle || 0,
        };
        return;
      }
      if (control?.startsWith("resize-")) {
        const cx = selectedObj.x + selectedObj.width / 2;
        const cy = selectedObj.y + selectedObj.height / 2;
        const local = toLocalPoint(selectedObj, pos.x, pos.y);
        dragStateRef.current = {
          mode: "resize",
          handle: control.replace("resize-", ""),
          objId: selectedObj.id,
          centerX: cx,
          centerY: cy,
          startLocalX: local.x,
          startLocalY: local.y,
          origWidth: selectedObj.width,
          origHeight: selectedObj.height,
          origCenterX: cx,
          origCenterY: cy,
          angleRad: ((selectedObj.angle || 0) * Math.PI) / 180,
        };
        selectedObj.autoWidth = false;
        return;
      }
      if (control === "move") {
        dragStateRef.current = {
          mode: "move",
          objId: selectedObj.id,
          startX: pos.x,
          startY: pos.y,
          origX: selectedObj.x,
          origY: selectedObj.y,
        };
        return;
      }
    }

    const hit = hitTest(pos.x, pos.y);
    if (hit) {
      selectObject(hit);
      dragStateRef.current = {
        mode: "move",
        objId: hit.id,
        startX: pos.x,
        startY: pos.y,
        origX: hit.x,
        origY: hit.y,
      };
    } else {
      selectObject(null);
    }
  };

  const handleMouseMove = (e) => {
    const pos = eventToCanvas(e);
    const canvas = canvasRef.current;

    const drag = dragStateRef.current;
    if (!drag) {
      if (canvas && selectedIdRef.current) {
        const selectedObj = objectsRef.current.find((o) => o.id === selectedIdRef.current);
        if (selectedObj) {
          const control = getControlHit(selectedObj, pos.x, pos.y);
          const cursorMap = {
            "resize-n": "ns-resize",
            "resize-s": "ns-resize",
            "resize-e": "ew-resize",
            "resize-w": "ew-resize",
            "resize-ne": "nesw-resize",
            "resize-sw": "nesw-resize",
            "resize-nw": "nwse-resize",
            "resize-se": "nwse-resize",
          };
          canvas.style.cursor = control === "rotate" ? "grab" : cursorMap[control] || (control === "move" ? "move" : "default");
        }
      }
      return;
    }

    const obj = objectsRef.current.find((o) => o.id === drag.objId);
    if (!obj) return;

    if (drag.mode === "move") {
      const dx = pos.x - drag.startX;
      const dy = pos.y - drag.startY;
      obj.x = drag.origX + dx;
      obj.y = drag.origY + dy;
    }

    if (drag.mode === "rotate") {
      const currentPointerAngle = Math.atan2(pos.y - drag.centerY, pos.x - drag.centerX);
      const delta = currentPointerAngle - drag.startPointerAngle;
      obj.angle = drag.origAngle + (delta * 180) / Math.PI;
      setSelected({ ...obj });
    }

    if (drag.mode === "resize") {
      const local = toLocalPoint(obj, pos.x, pos.y);
      const dx = local.x - drag.startLocalX;
      const dy = local.y - drag.startLocalY;

      let w = drag.origWidth;
      let h = drag.origHeight;
      let shiftX = 0;
      let shiftY = 0;
      const minW = 40;
      const minH = obj.fontSize * 1.3;
      const handle = drag.handle;

      if (handle.includes("e")) { w = Math.max(minW, drag.origWidth + dx); shiftX = (w - drag.origWidth) / 2; }
      if (handle.includes("w")) { w = Math.max(minW, drag.origWidth - dx); shiftX = -(w - drag.origWidth) / 2; }
      if (handle.includes("s")) { h = Math.max(minH, drag.origHeight + dy); shiftY = (h - drag.origHeight) / 2; }
      if (handle.includes("n")) { h = Math.max(minH, drag.origHeight - dy); shiftY = -(h - drag.origHeight) / 2; }

      const cos = Math.cos(drag.angleRad);
      const sin = Math.sin(drag.angleRad);
      const worldShiftX = shiftX * cos - shiftY * sin;
      const worldShiftY = shiftX * sin + shiftY * cos;
      const newCenterX = drag.origCenterX + worldShiftX;
      const newCenterY = drag.origCenterY + worldShiftY;

      obj.width = w;
      obj.height = h;
      obj.x = newCenterX - w / 2;
      obj.y = newCenterY - h / 2;
      obj.autoWidth = false;
      setSelected({ ...obj });
    }

    scheduleRender();
  };

  const handleMouseUp = () => {
    if (dragStateRef.current) {
      const obj = objectsRef.current.find((o) => o.id === dragStateRef.current.objId);
      if (obj) setSelected({ ...obj });
      dragStateRef.current = null;
      saveHistory();
    }
  };

  /* ── Selection helpers ──────────────────────────────── */
  const selectObject = (obj) => {
    if (!obj) {
      selectedIdRef.current = null;
      setSelected(null);
    } else {
      selectedIdRef.current = obj.id;
      setSelected(obj);
      setFontSize(obj.fontSize);
      setFontFamily(obj.fontFamily);
      setTextColor(obj.fill);
      setIsBold(obj.fontWeight === "bold");
      setIsItalic(obj.fontStyle === "italic");
      setTextAlign(obj.textAlign);
    }
    scheduleRender();
  };

  const updateSelection = (obj) => {
    if (!obj) {
      setSelected(null);
      selectedIdRef.current = null;
      return;
    }
    selectedIdRef.current = obj.id;
    setSelected(obj);
    setFontSize(obj.fontSize || 48);
    setFontFamily(obj.fontFamily || "Inter");
    setTextColor(obj.fill || "#000000");
    setIsBold(obj.fontWeight === "bold");
    setIsItalic(obj.fontStyle === "italic");
    setTextAlign(obj.textAlign || "center");
  };

  /* ── History ────────────────────────────────────────── */
  const saveHistory = () => {
    const snapshot = JSON.stringify(
      objectsRef.current.map((o) => ({ ...o }))
    );
    const hist = historyRef.current;
    hist.splice(historyIdxRef.current + 1);
    hist.push(snapshot);
    if (hist.length > 50) hist.shift();
    historyIdxRef.current = hist.length - 1;
  };

  const restoreFromHistory = (json) => {
    try {
      objectsRef.current = JSON.parse(json);
    } catch (e) {
      console.error("Failed to restore history:", e);
    }
    // Re-sync selection if selected object still exists
    if (selectedIdRef.current) {
      const obj = objectsRef.current.find(
        (o) => o.id === selectedIdRef.current
      );
      if (obj) updateSelection(obj);
      else selectObject(null);
    }
    scheduleRender();
  };

  /* ── Actions ────────────────────────────────────────── */

  const handleBackgroundUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackgroundFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target.result;
      setBackgroundPreview(url);
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;

        // Immediately sync actual canvas buffer size
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = w;
          canvas.height = h;
        }

        setCanvasWidth(w);
        setCanvasHeight(h);
        bgImageRef.current = img;

        requestAnimationFrame(() => {
          fitCanvas();
          scheduleRender();
        });

        toast.success("Background uploaded");
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const addParticipantName = () => {
    const existing = objectsRef.current.find((o) => o.role === "participant_name");
    if (existing) {
      selectObject(existing);
      toast("Participant name field already exists");
      return;
    }

    const obj = createTextObject({
      text: "{{participant_name}}",
      x: canvasWidth / 2 - 200,
      y: canvasHeight / 2 - 30,
      width: 400,
      fontSize: 64,
      fontFamily: "Georgia",
      fill: "#0f766e",
      fontWeight: "bold",
      textAlign: "center",
      role: "participant_name",
    });

    const ctx = ctxRef.current;
    if (ctx) {
      const weight = obj.fontWeight === "bold" ? "bold" : "normal";
      ctx.font = `${weight} ${obj.fontSize}px "${obj.fontFamily}"`;
      const lines = wrapText(ctx, obj.text, obj.width);
      obj.height = lines.length * obj.fontSize * 1.3;
    }

    objectsRef.current.push(obj);
    selectObject(obj);
    saveHistory();
    toast.success("Participant Name field added");
  };

  const deleteSelected = () => {
    if (!selectedIdRef.current) return;
    objectsRef.current = objectsRef.current.filter(
      (o) => o.id !== selectedIdRef.current
    );
    selectObject(null);
    saveHistory();
    scheduleRender();
  };

  const undo = () => {
    const hist = historyRef.current;
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current--;
    skipHistoryRef.current = true;
    restoreFromHistory(hist[historyIdxRef.current]);
    skipHistoryRef.current = false;
  };

  const redo = () => {
    const hist = historyRef.current;
    if (historyIdxRef.current >= hist.length - 1) return;
    historyIdxRef.current++;
    skipHistoryRef.current = true;
    restoreFromHistory(hist[historyIdxRef.current]);
    skipHistoryRef.current = false;
  };

  /* ── Property updaters ──────────────────────────────── */
  const applyProp = (prop, value) => {
    const obj = objectsRef.current.find((o) => o.id === selectedIdRef.current);
    if (!obj) return;
    obj[prop] = value;
    scheduleRender();
    saveHistory();
    // Refresh selected reference so UI stays in sync
    setSelected({ ...obj });
  };

  const handleFontSize = (val) => {
    setFontSize(val);
    applyProp("fontSize", val);
  };

  const handleFontFamily = (val) => {
    setFontFamily(val);
    applyProp("fontFamily", val);
  };

  const handleColor = (val) => {
    setTextColor(val);
    applyProp("fill", val);
  };

  const toggleBold = () => {
    const next = !isBold;
    setIsBold(next);
    applyProp("fontWeight", next ? "bold" : "normal");
  };

  const toggleItalic = () => {
    const next = !isItalic;
    setIsItalic(next);
    applyProp("fontStyle", next ? "italic" : "normal");
  };

  const handleAlign = (align) => {
    setTextAlign(align);
    applyProp("textAlign", align);
  };


  /* ── Save template ──────────────────────────────────── */
  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error("Give the template a name");
      return;
    }
    if (!backgroundPreview && !backgroundFile) {
      toast.error("Upload a background image first");
      return;
    }

    setSaving(true);

    // Serialize objects (no background image in JSON)
    const json = JSON.stringify({ objects: objectsRef.current });

    const formData = new FormData();
    formData.append("name", templateName.trim());
    formData.append("canvas_json", json);
    formData.append("canvas_width", canvasWidth);
    formData.append("canvas_height", canvasHeight);
    if (backgroundFile) formData.append("background", backgroundFile);

    let res;
    if (id) {
      res = await certificateService.updateTemplate(id, formData);
    } else {
      res = await certificateService.createTemplate(formData);
    }

    if (res.ok) {
      toast.success(id ? "Template updated" : "Template created");
      if (!id && res.data?.id) {
        navigate(`/template-editor/${res.data.id}`, { replace: true });
      }
    } else {
      toast.error(res.error || "Failed to save template");
    }
    setSaving(false);
  };

  /* ── Preview ────────────────────────────────────────── */
  const handlePreview = async () => {
    const previewCanvas = document.createElement("canvas");
    previewCanvas.width = canvasWidth;
    previewCanvas.height = canvasHeight;
    const pctx = previewCanvas.getContext("2d");

    pctx.fillStyle = "#f3f4f6";
    pctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const bgImg = bgImageRef.current;
    if (bgImg) pctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);

    for (const obj of objectsRef.current) {
      const displayText = obj.text === "{{participant_name}}" ? "Srijana Dahal" : obj.text;

      pctx.save();
      pctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
      pctx.rotate((obj.angle * Math.PI) / 180);

      const weight = obj.fontWeight === "bold" ? "bold" : "normal";
      const style = obj.fontStyle === "italic" ? "italic" : "normal";
      pctx.font = `${style} ${weight} ${obj.fontSize}px "${obj.fontFamily}"`;
      pctx.fillStyle = obj.fill;
      pctx.textAlign = obj.textAlign;
      pctx.textBaseline = "middle";

      const lines = obj.autoWidth ? (displayText || "").split("\n") : wrapText(pctx, displayText, obj.width);
      const lineHeight = obj.fontSize * 1.3;
      const totalHeight = obj.autoWidth
        ? Math.max(lineHeight, Math.ceil(lines.length * lineHeight + (obj.paddingY || 0) * 2))
        : lines.length * lineHeight;
      const textY = -(totalHeight / 2) + lineHeight / 2 + (obj.autoWidth ? (obj.paddingY || 0) : 0);

      for (let i = 0; i < lines.length; i++) {
        let lx = 0;
        if (obj.textAlign === "left") lx = -obj.width / 2;
        else if (obj.textAlign === "right") lx = obj.width / 2;
        pctx.fillText(lines[i], lx, textY + i * lineHeight);
      }
      pctx.restore();
    }

    setPreviewImage(previewCanvas.toDataURL("image/png", 1));
  };

  /* ── Keyboard shortcuts ─────────────────────────────── */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && previewImage) {
        e.preventDefault();
        setPreviewImage(null);
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIdRef.current && document.activeElement === document.body) {
          e.preventDefault();
          deleteSelected();
        }
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
        if (e.key === "z" && e.shiftKey) { e.preventDefault(); redo(); }
        if (e.key === "y") { e.preventDefault(); redo(); }
        if (e.key === "s") { e.preventDefault(); handleSave(); }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selected, id, previewImage]);

  if (loading) return <Loading />;

  return (
    <div className="h-screen bg-[#f6f7f9] p-4 text-slate-800">
      <div className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Main Menu / Certificates / Template Editor</p>
            <h1 className="text-3xl font-semibold mt-1">Certificate Template Editor</h1>
            <p className="text-sm text-slate-500">Add and position text fields on your certificate template.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePreview} className="px-4 py-2 text-sm border border-slate-300 rounded-lg inline-flex items-center gap-2 hover:bg-slate-50">
              <IoEyeOutline /> Preview
            </button>
            <button disabled className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-500">Save Draft</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60">
              {saving ? "Saving..." : "Save Template"}
            </button>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-slate-200 flex items-center gap-2 text-sm">
          <button onClick={() => navigate(-1)} className="px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 inline-flex items-center gap-1"><IoArrowBackOutline /> Back</button>
          <label className="px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 cursor-pointer inline-flex items-center gap-1">
            <IoCloudUploadOutline /> Upload Background
            <input type="file" accept="image/*" onChange={handleBackgroundUpload} className="hidden" />
          </label>
          <button onClick={addParticipantName} className="px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 inline-flex items-center gap-1"><IoTextOutline /> Add Text Field</button>
          <button onClick={undo} className="px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 inline-flex items-center gap-1"><IoArrowUndoOutline /> Undo</button>
          <button onClick={redo} className="px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 inline-flex items-center gap-1"><IoArrowRedoOutline /> Redo</button>
          <input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template name"
            className="ml-auto w-56 px-3 py-1.5 border border-slate-300 rounded-md text-sm"
          />
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div ref={containerRef} className="flex-1 bg-slate-50 p-4 overflow-auto">
            {!backgroundPreview && (
              <div className="h-full flex items-center justify-center">
                <label className="px-8 py-10 border-2 border-dashed border-slate-300 rounded-xl text-center cursor-pointer bg-white">
                  <p className="font-medium">Upload a certificate background</p>
                  <p className="text-sm text-slate-500 mt-1">PNG or JPG</p>
                  <input type="file" accept="image/*" onChange={handleBackgroundUpload} className="hidden" />
                </label>
              </div>
            )}
            <div className="mx-auto w-fit rounded-lg border border-slate-300 bg-white p-2 shadow-sm">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: "default" }}
              />
            </div>
          </div>

          <div className="w-80 border-l border-slate-200 bg-white p-4 overflow-auto">
            <div className="grid grid-cols-2 text-sm border border-slate-200 rounded-lg overflow-hidden mb-4">
              <button className="py-2 bg-emerald-50 text-emerald-700 font-medium">Fields</button>
              <button className="py-2 text-slate-500">Properties</button>
            </div>

            <button onClick={addParticipantName} className="w-full mb-4 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
              + Add Text Field
            </button>

            <p className="text-xs font-semibold text-slate-500 mb-2">Fields</p>
            <button
              onClick={() => {
                const participant = objectsRef.current.find((o) => o.role === "participant_name");
                if (participant) selectObject(participant);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-left text-sm hover:bg-slate-50"
            >
              participant_name
            </button>

            {selected && (
              <div className="mt-5 space-y-3">
                <p className="text-xs font-semibold text-slate-500">Selected Field</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input value={Math.round(selected.x)} onChange={(e) => applyProp("x", Number(e.target.value))} className="px-2 py-2 border border-slate-300 rounded" />
                  <input value={Math.round(selected.y)} onChange={(e) => applyProp("y", Number(e.target.value))} className="px-2 py-2 border border-slate-300 rounded" />
                </div>
                <select value={fontFamily} onChange={(e) => handleFontFamily(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded text-sm">
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => handleFontSize(Math.max(12, fontSize - 4))} className="px-2 border border-slate-300 rounded"><IoRemoveOutline /></button>
                  <select value={fontSize} onChange={(e) => handleFontSize(Number(e.target.value))} className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm">
                    {FONT_SIZES.map((s) => <option key={s} value={s}>{s}px</option>)}
                  </select>
                  <button onClick={() => handleFontSize(Math.min(200, fontSize + 4))} className="px-2 border border-slate-300 rounded"><IoAddOutline /></button>
                </div>
                <input type="color" value={textColor} onChange={(e) => handleColor(e.target.value)} className="w-full h-10 border border-slate-300 rounded" />
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={toggleBold} className={`py-2 rounded border ${isBold ? "bg-emerald-50 border-emerald-300" : "border-slate-300"}`}><MdFormatBold className="mx-auto" /></button>
                  <button onClick={toggleItalic} className={`py-2 rounded border ${isItalic ? "bg-emerald-50 border-emerald-300" : "border-slate-300"}`}><MdFormatItalic className="mx-auto" /></button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['left','center','right'].map((align) => (
                    <button key={align} onClick={() => handleAlign(align)} className={`py-2 rounded border text-xs ${textAlign === align ? "bg-emerald-50 border-emerald-300" : "border-slate-300"}`}>{align}</button>
                  ))}
                </div>
                <button onClick={deleteSelected} className="w-full py-2 rounded border border-red-200 text-red-600 hover:bg-red-50 inline-flex justify-center items-center gap-1"><IoTrashOutline /> Remove Field</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 px-3 py-1.5 rounded-md bg-white/10 text-white border border-white/20 hover:bg-white/20"
          >
            Close (Esc)
          </button>
          <img
            src={previewImage}
            alt="Template preview"
            className="max-w-[95vw] max-h-[92vh] rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
