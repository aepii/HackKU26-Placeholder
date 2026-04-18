import { ArchSchema, ImprovedSchema, HistoryItem } from "./types/chart.types";

const BASE = "http://localhost:8000";

export async function validateArchitecture(
  imageUri: string,
  file?: File,
): Promise<ArchSchema> {
  const form = new FormData();

  if (file) {
    // Web: real File object from the browser
    form.append("file", file);
  } else {
    // Native device: React Native's special URI object
    form.append("file", {
      uri: imageUri,
      name: "photo.jpg",
      type: "image/jpeg",
    } as any);
  }

  // Send the image to the backend for validation
  const response = await fetch(`${BASE}/api/validate-architecture`, {
    method: "POST",
    body: form,
  });

  // Handle errors
  if (!response.ok) {
    const error = await response.json();
    throw { response: { data: error } };
  }

  return response.json();
}

// API call to fetch the history of uploaded architecture diagrams and their extracted information
export async function getHistory(): Promise<HistoryItem[]> {
  const res = await fetch(`${BASE}/api/history`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

// API call to delete a specific history item by its ID
export async function deleteHistoryItem(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/history/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete item");
}

// API call to get improvement suggestions based on the analysis of the architecture diagram, using the extracted nodes, edges, and feedback as input
export async function improveArchitecture(
  nodes: any[],
  edges: any[],
  feedback: string[],
): Promise<ImprovedSchema> {
  const res = await fetch(`${BASE}/api/improve-architecture`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nodes, edges, feedback }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw { response: { data: error } };
  }
  return res.json();
}

export async function getSharedArchitecture(
  token: string,
): Promise<ArchSchema> {
  const response = await fetch(`${BASE}/api/share/${token}`);
  if (!response.ok) {
    const error = await response.json();
    throw { response: { data: error } };
  }
  return response.json();
}

export async function askAboutArchitecture(
  nodes: any[],
  edges: any[],
  zones: any[],
  question: string,
): Promise<{ answer: string }> {
  const res = await fetch(`${BASE}/api/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nodes, edges, zones, question }),
  });
  if (!res.ok) throw new Error("Failed to ask");
  return res.json();
}
