import { useEffect, useState } from "react";

const useShrinkHeader = () => {
  const [shrink, setShrink] = useState(false);

  useEffect(() => {
    const onScroll = () => setShrink(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return shrink;
};

export default useShrinkHeader;
