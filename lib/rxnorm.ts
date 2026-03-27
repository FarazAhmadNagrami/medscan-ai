export interface RxNormDrug {
  rxcui: string;
  name: string;
  synonym?: string;
  tty?: string;
  language?: string;
  suppress?: string;
  umlscui?: string;
}

export async function fetchRxNormData(
  medicineName: string
): Promise<RxNormDrug | null> {
  try {
    const encoded = encodeURIComponent(medicineName);
    const res = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encoded}`,
      { cache: "force-cache" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const rxcui = data?.idGroup?.rxnormId?.[0];
    if (!rxcui) return null;

    const detailRes = await fetch(
      `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/allrelated.json`
    );
    if (!detailRes.ok) return { rxcui, name: medicineName };
    const detail = await detailRes.json();
    const concept = detail?.allRelatedGroup?.conceptGroup?.[0]?.conceptProperties?.[0];

    return {
      rxcui,
      name: concept?.name ?? medicineName,
      synonym: concept?.synonym ?? undefined,
      tty: concept?.tty ?? undefined,
      language: concept?.language ?? undefined,
      suppress: concept?.suppress ?? undefined,
      umlscui: concept?.umlscui ?? undefined,
    };
  } catch {
    return null;
  }
}
