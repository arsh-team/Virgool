"use client";

import dynamic from "next/dynamic";

const BottomNav = dynamic(() => import("./bottomNav"), {
  ssr: false,
  loading: () => null,
});

export default BottomNav;
