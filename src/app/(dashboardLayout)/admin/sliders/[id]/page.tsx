"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Check, Loader2, Upload } from "lucide-react";
import { sliderService, type SliderData } from "@/services/api/slider.service";
import { sliderTypeService, type SliderType } from "@/services/api/slider.types";
import { oracleService } from "@/services/api/oracel.service";
import { uploadImageToImageBB } from "@/lib/imageUpload";

type SliderMode = "image" | "game";

type Provider = {
  code: string;
  id?: string;
  name: string;
};

type Game = {
  game_code: string;
  game_id?: string;
  provider_code: string;
  provider_id?: string;
  game_type?: string;
  name?: string;
  image?: string;
};

type SliderResponse = {
  _id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  sliderTypeId?: string;
  buttonText?: string;
  buttonLink?: string;
  imageRedirectLink?: string;
  money?: number;
  username?: string;
  provider_code?: string;
  provider_id?: string;
  game_code?: string;
  game_id?: string;
  game_type?: string;
  detailTitle?: string;
  detailSubtitle?: string;
  activityTimeText?: string;
  introText?: string;
  rewardDetailsText?: string;
  rulesText?: string;
  order?: number;
  isActive?: boolean;
};

type FormDataState = {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  sliderTypeId: string;
  buttonText: string;
  buttonLink: string;
  imageRedirectLink: string;
  order: number;
  isActive: boolean;
  money: string;
  username: string;
  detailTitle: string;
  detailSubtitle: string;
  activityTimeText: string;
  introText: string;
  rewardDetailsText: string;
  rulesText: string;
};

const initialFormData: FormDataState = {
  title: "",
  subtitle: "",
  description: "",
  image: "",
  sliderTypeId: "",
  buttonText: "",
  buttonLink: "",
  imageRedirectLink: "",
  order: 0,
  isActive: true,
  money: "",
  username: "",
  detailTitle: "",
  detailSubtitle: "",
  activityTimeText: "",
  introText: "",
  rewardDetailsText: "",
  rulesText: "",
};

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x220?text=No+Image";
const IMAGE_ONLY_SLIDER_TYPES = new Set(["home", "hero", "promotion"]);

const asArray = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  return [];
};

const toProviders = (raw: unknown): Provider[] => {
  const list = asArray<Record<string, unknown>>(raw);
  return list.reduce<Provider[]>((acc, item) => {
      const code =
        (item.code as string) ||
        (item.provider_code as string) ||
        (item.providerCode as string) ||
        "";
      const name =
        (item.name as string) ||
        (item.provider_name as string) ||
        (item.providerName as string) ||
        code;
      const id = (item.id as string) || (item.provider_id as string) || (item.providerId as string);
      if (!code) return acc;
      acc.push({ code, name, id });
      return acc;
    }, []);
};

const toGames = (raw: unknown, providerFallbackId?: string): Game[] => {
  const list = asArray<Record<string, unknown>>(raw);
  return list.reduce<Game[]>((acc, item) => {
      const provider_code =
        (item.provider_code as string) ||
        (item.providerCode as string) ||
        (item.provider as string) ||
        "";
      const providerObject = item.provider as Record<string, unknown> | undefined;
      const game_code = (item.game_code as string) || (item.gameCode as string) || (item.code as string) || "";
      if (!provider_code || !game_code) return acc;

      acc.push({
        provider_code,
        game_code,
        provider_id:
          (item.provider_id as string) ||
          (item.providerId as string) ||
          (item.provider_id_ref as string) ||
          (item.provider_id_fk as string) ||
          (providerObject?._id as string) ||
          providerFallbackId ||
          undefined,
        game_id:
          (item.game_id as string) ||
          (item.gameId as string) ||
          (item._id as string) ||
          (item.id as string) ||
          undefined,
        game_type: (item.game_type as string) || (item.gameType as string) || undefined,
        name: (item.name as string) || (item.title as string) || game_code,
        image: (item.image as string) || (item.thumbnail as string) || undefined,
      });

      return acc;
    }, []);
};

export default function EditSliderPage() {
  const router = useRouter();
  const params = useParams();
  const sliderId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [types, setTypes] = useState<SliderType[]>([]);
  const [mode, setMode] = useState<SliderMode>("image");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providerCode, setProviderCode] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameCode, setSelectedGameCode] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState<FormDataState>(initialFormData);

  const selectedType = useMemo(
    () => types.find((item) => item._id === formData.sliderTypeId),
    [types, formData.sliderTypeId]
  );

  const filteredTypes = useMemo(() => {
    const normalize = (value?: string) => (value || "").trim().toLowerCase();

    if (mode === "image") {
      return types.filter((item) => IMAGE_ONLY_SLIDER_TYPES.has(normalize(item.name)));
    }

    return types.filter((item) => !IMAGE_ONLY_SLIDER_TYPES.has(normalize(item.name)));
  }, [types, mode]);

  useEffect(() => {
    const init = async () => {
      try {
        const [typeRes, sliderRes] = await Promise.all([
          sliderTypeService.getAllSliderTypes(),
          sliderService.getSliderById(sliderId),
        ]);

        const loadedTypes = asArray<SliderType>(typeRes?.data);
        const slider = (sliderRes?.data || sliderRes) as SliderResponse;
        setTypes(loadedTypes);

        const hasGame = Boolean(slider.provider_code && slider.game_code);
        const detectedMode: SliderMode = hasGame ? "game" : "image";
        setMode(detectedMode);

        const resolvedSliderTypeId =
          typeof slider.sliderTypeId === "string"
            ? slider.sliderTypeId
            : (slider.sliderTypeId as unknown as { _id?: string })?._id || "";

        setFormData({
          title: slider.title || "",
          subtitle: slider.subtitle || "",
          description: slider.description || "",
          image: slider.image || "",
          sliderTypeId: resolvedSliderTypeId,
          buttonText: slider.buttonText || "",
          buttonLink: slider.buttonLink || "",
          imageRedirectLink: slider.imageRedirectLink || "",
          order: slider.order || 0,
          isActive: slider.isActive ?? true,
          money: slider.money?.toString() || "",
          username: slider.username || "",
          detailTitle: slider.detailTitle || "",
          detailSubtitle: slider.detailSubtitle || "",
          activityTimeText: slider.activityTimeText || "",
          introText: slider.introText || "",
          rewardDetailsText: slider.rewardDetailsText || "",
          rulesText: slider.rulesText || "",
        });

        if (slider.provider_code) {
          setProviderCode(slider.provider_code);
        }
        if (slider.game_code) {
          setSelectedGameCode(slider.game_code);
        }
      } catch {
        toast.error("Failed to load slider");
        router.push("/admin/slider-controll");
      } finally {
        setInitializing(false);
      }
    };

    if (sliderId) {
      void init();
    }
  }, [router, sliderId]);

  useEffect(() => {
    if (!formData.sliderTypeId) return;
    if (!filteredTypes.some((item) => item._id === formData.sliderTypeId)) {
      setFormData((prev) => ({ ...prev, sliderTypeId: "" }));
    }
  }, [filteredTypes, formData.sliderTypeId]);

  useEffect(() => {
    const loadProviders = async () => {
      setProviders([]);
      setGames([]);

      if (!selectedType || mode !== "game") {
        return;
      }

      const preferredCode = selectedType.providerCode?.trim();
      if (preferredCode) {
        const codeList = preferredCode
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        const nameList = (selectedType.providerName || "")
          .split(",")
          .map((item) => item.trim());

        const mappedProviders = codeList.map((code, index) => ({
          code,
          name: nameList[index] || code,
        }));

        setProviders(mappedProviders);
        if (!providerCode) {
          setProviderCode(mappedProviders[0]?.code || "");
        }
        return;
      }

      try {
        const providerRes = await oracleService.getProviders();
        const list = toProviders(providerRes?.data ?? providerRes?.providers ?? providerRes);
        setProviders(list);
      } catch {
        toast.error("Failed to load providers");
      }
    };

    void loadProviders();
  }, [selectedType, mode]);

  useEffect(() => {
    const loadGames = async () => {
      setGames([]);

      if (!providerCode || mode !== "game") {
        return;
      }

      try {
        const detailRes = await oracleService.getProviderDetails(providerCode);
        const providerFallbackId =
          detailRes?.data?.provider?._id ||
          detailRes?.provider?._id ||
          detailRes?.data?.provider_id ||
          detailRes?.provider_id;
        const gameList = toGames(detailRes?.data?.games ?? detailRes?.games ?? [], providerFallbackId);
        setGames(gameList);

        if (selectedGameCode && !gameList.some((game) => game.game_code === selectedGameCode)) {
          setSelectedGameCode("");
        }
      } catch {
        toast.error("Failed to load games");
      }
    };

    void loadGames();
  }, [providerCode, mode]);

  const selectedGame = useMemo(
    () => games.find((game) => game.game_code === selectedGameCode),
    [games, selectedGameCode]
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "order" ? Number(value || 0) : value,
    }));
  };

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    try {
      setUploadingImage(true);
      const imageUrl = await uploadImageToImageBB(file);
      setFormData((prev) => ({ ...prev, image: imageUrl }));
      toast.success("Image uploaded");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const validate = (): boolean => {
    if (!formData.sliderTypeId) {
      toast.error("Please select a slider type");
      return false;
    }

    if (mode === "image" && !formData.image) {
      toast.error("Image is required for image mode");
      return false;
    }

    if (mode === "game" && !selectedGame) {
      toast.error("Please select a game");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const payload: Partial<SliderData> & { isActive?: boolean } = {
        title: formData.title.trim() || undefined,
        subtitle: formData.subtitle.trim() || undefined,
        description: formData.description.trim() || undefined,
        buttonText: formData.buttonText.trim() || undefined,
        buttonLink: formData.buttonLink.trim() || undefined,
        imageRedirectLink: formData.imageRedirectLink.trim() || undefined,
        sliderTypeId: formData.sliderTypeId,
        order: Number(formData.order) || 0,
        isActive: formData.isActive,
        money: formData.money ? Number(formData.money) : undefined,
        username: formData.username.trim() || undefined,
        detailTitle: formData.detailTitle.trim() || undefined,
        detailSubtitle: formData.detailSubtitle.trim() || undefined,
        activityTimeText: formData.activityTimeText.trim() || undefined,
        introText: formData.introText.trim() || undefined,
        rewardDetailsText: formData.rewardDetailsText.trim() || undefined,
        rulesText: formData.rulesText.trim() || undefined,
      };

      if (mode === "image") {
        payload.image = formData.image;
        payload.provider_code = undefined;
        payload.provider_id = undefined;
        payload.game_code = undefined;
        payload.game_id = undefined;
        payload.game_type = undefined;
      } else {
        payload.image = undefined;
        payload.provider_code = selectedGame?.provider_code;
        payload.provider_id = selectedGame?.provider_id;
        payload.game_code = selectedGame?.game_code;
        payload.game_id = selectedGame?.game_id;
        payload.game_type = selectedGame?.game_type || selectedType?.gameType;

        if (!payload.title) {
          payload.title = selectedGame?.name || selectedGame?.game_code;
        }
      }

      await sliderService.updateSlider(sliderId, payload);
      toast.success("Slider updated successfully");
      router.push("/admin/slider-controll");
    } catch {
      toast.error("Failed to update slider");
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin/slider-controll" className="inline-flex items-center gap-2 text-gray-300 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to slider control
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5 md:p-6">
          <h1 className="text-2xl font-semibold text-white">Edit Slider</h1>
          <p className="mt-1 text-sm text-gray-400">Update image and game launch configuration.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5 md:p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">Slider Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(["image", "game"] as SliderMode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium capitalize transition ${
                    mode === item
                      ? "border-yellow-500 bg-yellow-500/20 text-yellow-300"
                      : "border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5 md:p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Slider Type</h2>
            <select
              name="sliderTypeId"
              value={formData.sliderTypeId}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-white focus:border-yellow-500 focus:outline-none"
              required
            >
              <option value="">Select slider type</option>
              {filteredTypes.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
            {selectedType?.gameType ? (
              <p className="text-sm text-gray-400">Game type: {selectedType.gameType}</p>
            ) : null}
          </div>

          {mode !== "game" ? (
            <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5 md:p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Title"
                  className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-white focus:border-yellow-500 focus:outline-none"
                />
                <input
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  placeholder="Subtitle"
                  className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                rows={3}
                className="w-full rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-white focus:border-yellow-500 focus:outline-none"
              />
            </div>
          ) : null}

          {mode === "image" ? (
            <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5 md:p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Image</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="Image URL"
                  className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-white focus:border-yellow-500 focus:outline-none"
                />
                <label className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-600 bg-gray-900 px-3 py-3 text-gray-300 cursor-pointer hover:border-yellow-500/60">
                  <Upload className="h-4 w-4" />
                  {uploadingImage ? "Uploading..." : "Upload image"}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        void handleImageFile(file);
                      }
                    }}
                  />
                </label>
              </div>
              {formData.image ? (
                <img
                  src={formData.image}
                  alt="Slider preview"
                  className="h-44 w-full rounded-xl border border-gray-700 object-cover"
                  onError={(event) => {
                    event.currentTarget.src = PLACEHOLDER_IMAGE;
                  }}
                />
              ) : null}
            </div>
          ) : null}

          {mode !== "game" ? (
            <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5 md:p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Button Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="buttonText"
                  value={formData.buttonText}
                  onChange={handleChange}
                  placeholder="Button text"
                  className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-white focus:border-yellow-500 focus:outline-none"
                />
                <input
                  name="buttonLink"
                  value={formData.buttonLink}
                  onChange={handleChange}
                  placeholder="Button link"
                  className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>
            </div>
          ) : null}

          {selectedType?.name?.toLowerCase() === "promotion" ? (
            <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5 md:p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Promotion Detail Conditions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="detailTitle"
                  value={formData.detailTitle}
                  onChange={handleChange}
                  placeholder="Detail title"
                  className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-white focus:border-yellow-500 focus:outline-none"
                />
                <input
                  name="detailSubtitle"
                  value={formData.detailSubtitle}
                  onChange={handleChange}
                  placeholder="Detail subtitle"
                  className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>
              <input
                name="activityTimeText"
                value={formData.activityTimeText}
                onChange={handleChange}
                placeholder="Activity time text"
                className="w-full rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-white focus:border-yellow-500 focus:outline-none"
              />
              <textarea
                name="introText"
                value={formData.introText}
                onChange={handleChange}
                placeholder="Intro text"
                rows={3}
                className="w-full rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-white focus:border-yellow-500 focus:outline-none"
              />
              <textarea
                name="rewardDetailsText"
                value={formData.rewardDetailsText}
                onChange={handleChange}
                placeholder="Reward details (one line per condition)"
                rows={4}
                className="w-full rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-white focus:border-yellow-500 focus:outline-none"
              />
              <textarea
                name="rulesText"
                value={formData.rulesText}
                onChange={handleChange}
                placeholder="Rules (one line per rule)"
                rows={4}
                className="w-full rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-white focus:border-yellow-500 focus:outline-none"
              />
            </div>
          ) : null}

          {mode === "game" ? (
            <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5 md:p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Game Selection</h2>

              <select
                value={providerCode}
                onChange={(e) => {
                  setProviderCode(e.target.value);
                  setSelectedGameCode("");
                }}
                className="w-full rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-white focus:border-yellow-500 focus:outline-none"
              >
                <option value="">Select provider</option>
                {providers.map((provider) => (
                  <option key={provider.code} value={provider.code}>
                    {provider.name}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-95 overflow-auto pr-1">
                {games.map((game) => {
                  const selected = selectedGameCode === game.game_code;
                  return (
                    <button
                      key={game.game_code}
                      type="button"
                      onClick={() => setSelectedGameCode(game.game_code)}
                      className={`rounded-xl border p-3 text-left transition ${
                        selected
                          ? "border-green-500 bg-green-500/10"
                          : "border-gray-700 bg-gray-900 hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm font-medium text-white">
                        <span className={`inline-flex h-5 w-5 items-center justify-center rounded border ${selected ? "border-green-500 bg-green-500 text-black" : "border-gray-600"}`}>
                          {selected ? <Check className="h-3.5 w-3.5" /> : null}
                        </span>
                        {game.name || game.game_code}
                      </div>
                      <p className="mt-2 text-xs text-gray-400">Code: {game.game_code}</p>
                      <p className="text-xs text-gray-500">Type: {game.game_type || selectedType?.gameType || "N/A"}</p>
                      <img
                        src={game.image || PLACEHOLDER_IMAGE}
                        alt={game.name || game.game_code}
                        className="mt-2 h-24 w-full rounded-lg border border-gray-700 object-cover"
                        onError={(event) => {
                          event.currentTarget.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5 md:p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Launch and Order</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="money"
                value={formData.money}
                onChange={handleChange}
                placeholder="Money (optional)"
                type="number"
                className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-white focus:border-yellow-500 focus:outline-none"
              />
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username (optional)"
                className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-white focus:border-yellow-500 focus:outline-none"
              />
              <input
                name="imageRedirectLink"
                value={formData.imageRedirectLink}
                onChange={handleChange}
                placeholder="Image redirect link"
                className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-white focus:border-yellow-500 focus:outline-none"
              />
              <input
                name="order"
                value={formData.order}
                onChange={handleChange}
                placeholder="Display order"
                type="number"
                className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-white focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
              />
              Active
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Updating..." : "Update slider"}
            </button>
            <Link
              href="/admin/slider-controll"
              className="inline-flex items-center rounded-xl border border-gray-700 bg-gray-900 px-5 py-3 text-gray-200 hover:bg-gray-800"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
