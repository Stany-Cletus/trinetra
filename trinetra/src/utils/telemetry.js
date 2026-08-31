const STORAGE_KEY = "trinetra_telemetry";

export function saveTelemetryEvent(event) {
  try {
    const existing = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    existing.push({
      ...event,
      timestamp: new Date().toISOString(),
    });

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(existing)
    );
  } catch (error) {
    console.error("Unable to save telemetry:", error);
  }
}

export function getTelemetry() {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
  } catch {
    return [];
  }
}

export function clearTelemetry() {
  localStorage.removeItem(STORAGE_KEY);
}