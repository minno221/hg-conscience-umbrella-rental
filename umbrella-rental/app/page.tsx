// app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  // 사이트 주소로 바로 들어왔을 때 자동으로 /umbrella 로 이동
  redirect("/umbrella");
}
