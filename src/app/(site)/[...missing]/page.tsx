import { notFound } from "next/navigation";

// Any address that matches no other page lands here and shows the site's own 404. Without this, those addresses would
// get the bare default 404, because a not-found file only gets the shell when it is rendered from inside it
export default function Missing() {
  notFound();
}
