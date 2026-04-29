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
  IoSaveOutline,
  IoTextOutline,
  IoTrashOutline,
  IoAddOutline,
  IoRemoveOutline,
} from "react-icons/io5";
import { MdFormatBold, MdFormatItalic } from "react-icons/md";
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

      // Word-wrap the text within obj.width
      const lines = wrapText(ctx, obj.text, obj.width);
      const lineHeight = obj.fontSize * 1.3;
      const totalHeight = lines.length * lineHeight;
      obj.height = totalHeight;

      const textX = 0; // already translated to center
      const textY = -(totalHeight / 2) + lineHeight / 2;

      for (let i = 0; i < lines.length; i++) {
        let lx = textX;
        if (obj.textAlign === "left") lx = -obj.width / 2;
        else if (obj.textAlign === "right") lx = obj.width / 2;
        ctx.fillText(lines[i], lx, textY + i * lineHeight);
      }

      // Selection outline
      if (obj.id === selectedIdRef.current) {
        ctx.strokeStyle = "#059669";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(-obj.width / 2, -totalHeight / 2, obj.width, totalHeight);
        ctx.setLineDash([]);

        // Corner handles
        const hs = 6;
        ctx.fillStyle = "#059669";
        const corners = [
          [-obj.width / 2, -totalHeight / 2],
          [obj.width / 2, -totalHeight / 2],
          [-obj.width / 2, totalHeight / 2],
          [obj.width / 2, totalHeight / 2],
        ];
        for (const [cx, cy] of corners) {
          ctx.fillRect(cx - hs / 2, cy - hs / 2, hs, hs);
        }
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
  const hitTest = (px, py) => {
    // Iterate in reverse (top-most first)
    for (let i = objectsRef.current.length - 1; i >= 0; i--) {
      const obj = objectsRef.current[i];
      // Transform point to object's local space
      const cx = obj.x + obj.width / 2;
      const cy = obj.y + obj.height / 2;
      const dx = px - cx;
      const dy = py - cy;
      const rad = -(obj.angle * Math.PI) / 180;
      const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
      const localY = dx * Math.sin(rad) + dy * Math.cos(rad);
      if (
        localX >= -obj.width / 2 &&
        localX <= obj.width / 2 &&
        localY >= -obj.height / 2 &&
        localY <= obj.height / 2
      ) {
        return obj;
      }
    }
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
    const drag = dragStateRef.current;
    if (!drag) return;

    const pos = eventToCanvas(e);
    const obj = objectsRef.current.find((o) => o.id === drag.objId);
    if (!obj) return;

    const dx = pos.x - drag.startX;
    const dy = pos.y - drag.startY;

    if (drag.mode === "move") {
      obj.x = drag.origX + dx;
      obj.y = drag.origY + dy;
    }

    scheduleRender();
  };

  const handleMouseUp = () => {
    if (dragStateRef.current) {
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
        setCanvasWidth(w);
        setCanvasHeight(h);
        bgImageRef.current = img;
        setTimeout(() => {
          fitCanvas();
          scheduleRender();
        }, 0);
        toast.success("Background uploaded");
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const addParticipantName = () => {
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

    // Compute initial height
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

  const handleRotation = (angle) => {
    const obj = objectsRef.current.find((o) => o.id === selectedIdRef.current);
    if (!obj) return;
    obj.angle = angle;
    setSelected({ ...obj });
    scheduleRender();
    saveHistory();
  };

  const handleWidth = (w) => {
    applyProp("width", w);
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

    // Background
    pctx.fillStyle = "#f3f4f6";
    pctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const bgImg = bgImageRef.current;
    if (bgImg) {
      pctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);
    }

    // Draw objects with sample data
    for (const obj of objectsRef.current) {
      const displayText =
        obj.text === "{{participant_name}}" ? "Srijana Dahal" : obj.text;

      pctx.save();
      pctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
      pctx.rotate((obj.angle * Math.PI) / 180);

      const weight = obj.fontWeight === "bold" ? "bold" : "normal";
      const style = obj.fontStyle === "italic" ? "italic" : "normal";
      pctx.font = `${style} ${weight} ${obj.fontSize}px "${obj.fontFamily}"`;
      pctx.fillStyle = obj.fill;
      pctx.textAlign = obj.textAlign;
      pctx.textBaseline = "middle";

      const lines = wrapText(pctx, displayText, obj.width);
      const lineHeight = obj.fontSize * 1.3;
      const totalHeight = lines.length * lineHeight;

      const textY = -(totalHeight / 2) + lineHeight / 2;
      for (let i = 0; i < lines.length; i++) {
        let lx = 0;
        if (obj.textAlign === "left") lx = -obj.width / 2;
        else if (obj.textAlign === "right") lx = obj.width / 2;
        pctx.fillText(lx === 0 ? lines[i] : lines[i], lx, textY + i * lineHeight);
      }
      pctx.restore();
    }

    const dataUrl = previewCanvas.toDataURL("image/png", 1);
    const win = window.open("");
    if (win) {
      win.document.write(`
        <html><head><title>Preview</title><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#1c1917;}</style></head>
        <body><img src="${dataUrl}" style="max-width:95vw;max-height:95vh;border-radius:12px;box-shadow:0 25px 50px rgba(0,0,0,0.5);"/></body></html>
      `);
    }
  };

  /* ── Keyboard shortcuts ─────────────────────────────── */
  useEffect(() => {
    const handleKey = (e) => {
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
  }, [selected, id]);

  if (loading) return <Loading />;

  return (
    <div className="h-screen flex flex-col bg-stone-900">
      {/* ── Top bar ──────────────────────────────────── */}
      <div className="shrink-0 h-14 bg-stone-800 border-b border-stone-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-white transition-colors"
          >
            <IoArrowBackOutline className="text-sm" />
            Back
          </button>
          <div className="w-px h-6 bg-stone-700" />
          <input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template name..."
            className="bg-transparent text-sm font-semibold text-white outline-none placeholder:text-stone-500 w-48"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePreview}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-300 bg-stone-700 rounded-lg hover:bg-stone-600 transition-colors"
          >
            <IoEyeOutline className="text-sm" />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
          >
            <IoSaveOutline className="text-sm" />
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left sidebar: Tools ──────────────────────── */}
        <div className="shrink-0 w-72 bg-stone-800 border-r border-stone-700 flex flex-col overflow-auto">
          {/* Upload background */}
          <div className="p-4 border-b border-stone-700">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-3">
              Background
            </p>
            <label className="flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium text-stone-300 bg-stone-700 rounded-xl cursor-pointer hover:bg-stone-600 transition-colors border border-dashed border-stone-600">
              <IoCloudUploadOutline className="text-base" />
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="hidden"
              />
            </label>
            {backgroundPreview && (
              <p className="text-[10px] text-stone-500 mt-2 text-center">
                {canvasWidth} × {canvasHeight}px
              </p>
            )}
          </div>

          {/* Fields */}
          <div className="p-4 border-b border-stone-700">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-3">
              Dynamic Fields
            </p>
            <button
              onClick={addParticipantName}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-stone-300 bg-stone-700 rounded-xl hover:bg-primary/20 hover:text-primary transition-colors"
            >
              <IoTextOutline className="text-base" />
              Add Participant Name
            </button>
            <p className="text-[10px] text-stone-600 mt-2">
              Click to place, then drag to position
            </p>
          </div>

          {/* Properties (shown when a text field is selected) */}
          {selected && (
            <div className="p-4 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Text Properties
              </p>

              {/* Font family */}
              <div>
                <label className="text-[10px] text-stone-500 mb-1 block">
                  Font
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => handleFontFamily(e.target.value)}
                  className="w-full bg-stone-700 text-stone-200 text-xs rounded-lg px-2.5 py-2 outline-none border border-stone-600 focus:border-primary/50"
                >
                  {FONTS.map((f) => (
                    <option key={f} value={f} style={{ fontFamily: f }}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font size */}
              <div>
                <label className="text-[10px] text-stone-500 mb-1 block">
                  Size
                </label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      handleFontSize(Math.max(12, fontSize - 4))
                    }
                    className="w-8 h-8 flex items-center justify-center bg-stone-700 rounded-lg text-stone-300 hover:bg-stone-600"
                  >
                    <IoRemoveOutline />
                  </button>
                  <select
                    value={fontSize}
                    onChange={(e) => handleFontSize(Number(e.target.value))}
                    className="flex-1 bg-stone-700 text-stone-200 text-xs rounded-lg px-2 py-2 outline-none border border-stone-600"
                  >
                    {FONT_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}px
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      handleFontSize(Math.min(200, fontSize + 4))
                    }
                    className="w-8 h-8 flex items-center justify-center bg-stone-700 rounded-lg text-stone-300 hover:bg-stone-600"
                  >
                    <IoAddOutline />
                  </button>
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="text-[10px] text-stone-500 mb-1 block">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => handleColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-stone-600 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => handleColor(e.target.value)}
                    className="flex-1 bg-stone-700 text-stone-200 text-xs rounded-lg px-2.5 py-2 outline-none border border-stone-600 font-mono"
                  />
                </div>
              </div>

              {/* Bold / Italic */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleBold}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors ${
                    isBold
                      ? "bg-primary text-white"
                      : "bg-stone-700 text-stone-300 hover:bg-stone-600"
                  }`}
                >
                  <MdFormatBold />
                </button>
                <button
                  onClick={toggleItalic}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors ${
                    isItalic
                      ? "bg-primary text-white"
                      : "bg-stone-700 text-stone-300 hover:bg-stone-600"
                  }`}
                  style={{ fontStyle: "italic" }}
                >
                  <MdFormatItalic />
                </button>
              </div>

              {/* Alignment */}
              <div>
                <label className="text-[10px] text-stone-500 mb-1 block">
                  Alignment
                </label>
                <div className="flex items-center gap-1.5">
                  {["left", "center", "right"].map((align) => (
                    <button
                      key={align}
                      onClick={() => handleAlign(align)}
                      className={`flex-1 py-1.5 text-[10px] font-medium rounded-lg transition-colors ${
                        textAlign === align
                          ? "bg-primary text-white"
                          : "bg-stone-700 text-stone-300 hover:bg-stone-600"
                      }`}
                    >
                      {align.charAt(0).toUpperCase() + align.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rotation */}
              <div>
                <label className="text-[10px] text-stone-500 mb-1 block">
                  Rotation
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={selected?.angle || 0}
                  onChange={(e) => handleRotation(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <p className="text-[10px] text-stone-500 text-center">
                  {Math.round(selected?.angle || 0)}°
                </p>
              </div>

              {/* Max width */}
              <div>
                <label className="text-[10px] text-stone-500 mb-1 block">
                  Max Width
                </label>
                <input
                  type="range"
                  min="100"
                  max={canvasWidth}
                  value={selected?.width || 400}
                  onChange={(e) => {
                    handleWidth(Number(e.target.value));
                  }}
                  className="w-full accent-primary"
                />
                <p className="text-[10px] text-stone-500 text-center">
                  {Math.round(selected?.width || 400)}px
                </p>
              </div>

              {/* Delete */}
              <button
                onClick={deleteSelected}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                <IoTrashOutline className="text-sm" />
                Remove Field
              </button>
            </div>
          )}
        </div>

        {/* ── Canvas area ─────────────────────────────── */}
        <div
          ref={containerRef}
          className="relative flex-1 flex flex-col items-center justify-center overflow-auto bg-stone-900 p-6"
        >
          {!backgroundPreview && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="text-center pointer-events-auto">
                <label className="flex flex-col items-center gap-3 px-8 py-10 bg-stone-800 rounded-2xl border border-dashed border-stone-600 cursor-pointer hover:border-primary/50 transition-colors">
                  <IoCloudUploadOutline className="text-4xl text-stone-500" />
                  <p className="text-sm font-medium text-stone-400">
                    Upload a certificate background
                  </p>
                  <p className="text-xs text-stone-600">
                    Design in Canva, export as PNG, then upload here
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-stone-700">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: selected ? "move" : "default" }}
            />
          </div>
        </div>

        {/* ── Right mini toolbar ──────────────────────── */}
        <div className="shrink-0 w-12 bg-stone-800 border-l border-stone-700 flex flex-col items-center py-3 gap-1">
          <button
            onClick={undo}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <IoArrowUndoOutline className="text-base" />
          </button>
          <button
            onClick={redo}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <IoArrowRedoOutline className="text-base" />
          </button>
        </div>
      </div>
    </div>
  );
}
