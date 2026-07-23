// @vitest-environment jsdom
import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CreateEventLogic from "./createEvent.logic.jsx";
import { eventService } from "../../services/events";

const navigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigate,
  useSearchParams: () => [new URLSearchParams()],
}));
vi.mock("react-hot-toast", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("../../services/events", () => ({
  eventService: { create: vi.fn(), update: vi.fn(), getById: vi.fn(), uploadImage: vi.fn() },
}));

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe("event creation form behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => "blob:poster");
  });

  it("submits the event entered by the organizer and returns to the event list", async () => {
    eventService.create.mockResolvedValue({ ok: true, data: { id: 42 } });
    eventService.uploadImage.mockResolvedValue({ ok: true, data: { image: "poster.jpg" } });
    const { result } = renderHook(() => CreateEventLogic(), { wrapper });

    act(() => {
      result.current.fields.setTitle("Community meetup");
      result.current.fields.setDescription("Meet your neighbors");
      result.current.fields.setStartDate("2026-08-01T10:00");
      result.current.fields.setEndDate("2026-08-01T12:00");
      result.current.fields.setCategory("Community");
      result.current.fields.setLocation("Kathmandu City Hall");
      result.current.fields.setLatitude("27.7172");
      result.current.fields.setLongitude("85.3240");
      result.current.handleImage({ target: { files: [new File(["poster"], "poster.png", { type: "image/png" })] } });
    });
    act(() => result.current.handleCreateEvent({ preventDefault: vi.fn() }));

    await waitFor(() => expect(eventService.create).toHaveBeenCalledOnce());
    expect(eventService.create).toHaveBeenCalledWith(expect.objectContaining({
      title: "Community meetup",
      description: "Meet your neighbors",
      start_date: "2026-08-01T10:00",
      end_date: "2026-08-01T12:00",
      medium: "offline",
      location_name: "Kathmandu City Hall",
      category: "Community",
    }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith(-1));
  });

  it("does not submit when required event details are missing", () => {
    const { result } = renderHook(() => CreateEventLogic(), { wrapper });

    act(() => result.current.handleCreateEvent({ preventDefault: vi.fn() }));

    expect(eventService.create).not.toHaveBeenCalled();
  });
});
