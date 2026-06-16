"use client";

import { useEffect, useState, useCallback } from "react";
import { Product } from "@/types";
import { useAuth } from "@/components/AuthProvider";
import { Plus, Pencil, Trash2, X, Upload, ImageIcon, GripVertical, AlertCircle } from "lucide-react";
import Image from "next/image";

interface UploadingFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  error?: string;
  url?: string;
}

export default function AdminProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    images: [],
    isActive: true,
  });
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function fetchProducts() {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/products?active=false", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", price: 0, stock: 0, category: "", images: [], isActive: true });
    setUploadingFiles([]);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({ ...product });
    setUploadingFiles([]);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (isUploading) {
      alert("Esperá a que terminen de subir las imágenes");
      return;
    }
    const token = await user.getIdToken();
    const isEdit = !!editing;
    const url = "/api/products";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(isEdit ? { id: editing.id, ...form } : form),
    });
    if (res.ok) {
      setModalOpen(false);
      fetchProducts();
    } else {
      alert("Error al guardar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm("¿Eliminar producto?")) return;
    const token = await user.getIdToken();
    await fetch(`/api/products?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchProducts();
  };

  const uploadFile = async (uploadingFile: UploadingFile) => {
    if (!user) return;
    const token = await user.getIdToken();
    const data = new FormData();
    data.append("file", uploadingFile.file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const result = await res.json();
      if (res.ok && result.url) {
        setUploadingFiles((prev) =>
          prev.map((f) => (f.id === uploadingFile.id ? { ...f, progress: 100, url: result.url } : f))
        );
        setForm((prev) => ({
          ...prev,
          images: [...(prev.images || []), result.url],
        }));
      } else {
        setUploadingFiles((prev) =>
          prev.map((f) => (f.id === uploadingFile.id ? { ...f, error: result.error || "Error al subir" } : f))
        );
      }
    } catch {
      setUploadingFiles((prev) =>
        prev.map((f) => (f.id === uploadingFile.id ? { ...f, error: "Error de red" } : f))
      );
    }
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) return;

      const newFiles: UploadingFile[] = imageFiles.map((file) => ({
        id: Math.random().toString(36).slice(2),
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
      }));

      setUploadingFiles((prev) => [...prev, ...newFiles]);
      setIsUploading(true);

      Promise.all(newFiles.map((f) => uploadFile(f))).finally(() => {
        setIsUploading(false);
      });
    },
    [user]
  );

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }));
  };

  const removeUploadingFile = (id: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform duration-[160ms] active:scale-[0.97]"
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          <Plus className="h-4 w-4" /> Nuevo
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Cargando...</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                <th className="px-4 py-3 font-normal">Imagen</th>
                <th className="px-4 py-3 font-normal">Nombre</th>
                <th className="px-4 py-3 font-normal">Precio</th>
                <th className="px-4 py-3 font-normal">Stock</th>
                <th className="px-4 py-3 font-normal">Categoría</th>
                <th className="px-4 py-3 font-normal">Estado</th>
                <th className="px-4 py-3 font-normal">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, index) => (
                <tr
                  key={p.id}
                  className="border-b border-border/50 transition-colors duration-150 hover:bg-muted/30"
                  style={{
                    transitionTimingFunction: "var(--ease-out)",
                    animation: `rowIn 200ms var(--ease-out) ${index * 30}ms both`,
                  }}
                >
                  <td className="px-4 py-3">
                    {p.images[0] ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="40px" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">${p.price.toLocaleString("es-AR")}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                      p.isActive
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-stone-100 text-stone-600 border-stone-200"
                    }`}>
                      {p.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-muted-foreground transition-colors duration-150 hover:text-foreground active:scale-[0.93]"
                        style={{ transitionTimingFunction: "var(--ease-out)" }}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-muted-foreground transition-colors duration-150 hover:text-destructive active:scale-[0.93]"
                        style={{ transitionTimingFunction: "var(--ease-out)" }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
            style={{ animation: "fadeIn 150ms var(--ease-out) forwards" }}
          />
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-xl"
            style={{
              transformOrigin: "center",
              animation: "modalIn 200ms var(--ease-out) forwards",
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing ? "Editar producto" : "Nuevo producto"}</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-md p-1 transition-colors duration-150 hover:bg-muted active:scale-[0.93]"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="mb-1 block text-xs font-medium">Nombre</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                  placeholder="Ej: Labial Matte Nude"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Descripción</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                  rows={3}
                  placeholder="Descripción del producto..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium">Precio</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Stock</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Categoría</label>
                <input
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-ring transition-shadow duration-150 focus:ring-1"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                  placeholder="Ej: Maquillaje"
                />
              </div>

              {/* Image Uploader */}
              <div>
                <label className="mb-2 block text-xs font-medium">Imágenes del producto</label>
                
                {/* Drag & Drop Zone */}
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-colors duration-200 ${
                    dragOver
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/30 hover:bg-muted/50"
                  }`}
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-foreground">
                    Arrastrá fotos acá o hacé click para seleccionar
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG, WEBP · Máx. 5MB por imagen
                  </p>
                </div>

                {/* Uploading files */}
                {uploadingFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadingFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-2"
                      >
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                          <Image src={file.preview} alt="Preview" fill className="object-cover" sizes="48px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-medium">{file.file.name}</p>
                          {file.error ? (
                            <p className="text-xs text-destructive">{file.error}</p>
                          ) : file.url ? (
                            <p className="text-xs text-emerald-600">✓ Subida exitosa</p>
                          ) : (
                            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeUploadingFile(file.id)}
                          className="rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Saved images */}
                {form.images && form.images.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs text-muted-foreground">
                      {form.images.length} {form.images.length === 1 ? "imagen" : "imágenes"} guardadas
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {form.images.map((img, index) => (
                        <div key={index} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-border">
                          <Image src={img} alt={`Producto ${index + 1}`} fill className="object-cover" sizes="80px" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="scale-75 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100"
                            >
                              <X className="h-5 w-5 text-white" />
                            </button>
                          </div>
                          {index === 0 && (
                            <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                              Principal
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="mt-3 rounded-lg border border-border bg-muted/20 p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" strokeWidth={1.5} />
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p><strong>Tip:</strong> Usá imágenes cuadradas (1:1) de buena calidad.</p>
                      <p>La primera imagen será la principal.</p>
                      <p>Podés arrastrar y soltar varias imágenes a la vez.</p>
                    </div>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-border"
                />
                <span>Producto activo (visible en la tienda)</span>
              </label>

              <button
                type="submit"
                disabled={isUploading}
                className="inline-flex w-full items-center justify-center rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-transform duration-[160ms] active:scale-[0.97] disabled:opacity-60"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              >
                {isUploading ? "Subiendo imágenes..." : editing ? "Guardar cambios" : "Crear producto"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
