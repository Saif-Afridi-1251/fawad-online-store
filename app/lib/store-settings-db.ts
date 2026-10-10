import { getDb } from "../../db";

export type SocialLinks = {
  facebook: string;
  instagram: string;
  youtube: string;
  x: string;
};

const EMPTY_SOCIAL_LINKS: SocialLinks = { facebook: "", instagram: "", youtube: "", x: "" };

export async function getSocialLinks(): Promise<SocialLinks> {
  const row = await getDb().prepare(
    `SELECT facebook_url AS facebook, instagram_url AS instagram,
      youtube_url AS youtube, x_url AS x FROM store_settings WHERE id = 'main'`
  ).first<SocialLinks>();
  return row ?? { ...EMPTY_SOCIAL_LINKS };
}

export async function saveSocialLinks(links: SocialLinks) {
  const now = new Date().toISOString();
  await getDb().prepare(
    `INSERT INTO store_settings (id, facebook_url, instagram_url, youtube_url, x_url, updated_at)
     VALUES ('main', ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET facebook_url = excluded.facebook_url,
       instagram_url = excluded.instagram_url, youtube_url = excluded.youtube_url,
       x_url = excluded.x_url, updated_at = excluded.updated_at`
  ).bind(links.facebook, links.instagram, links.youtube, links.x, now).run();
  return getSocialLinks();
}
