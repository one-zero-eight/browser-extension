import OptionBlock from "@/entrypoints/options/components/OptionBlock";
import { setStored, useStorage } from "@/shared/storage";
import type { LinkInfo } from "@/features/useful-links/links";
import { links } from "@/features/useful-links/links";

import LinkSetting from "@/entrypoints/options/components/LinkSetting";
import AboutSection from "@/entrypoints/options/components/AboutSection";
import { AutologinToggle } from "@/features/autologin/AutologinToggle";

export default function Options() {
  const pinnedLinks = JSON.parse(useStorage("pinnedLinks") ?? "{}") as Record<
    string,
    LinkInfo
  >;
  const pinnedCount = Object.keys(pinnedLinks).length;

  const toggleLink = (link: LinkInfo) => {
    const nextPinnedLinks = { ...pinnedLinks };

    if (pinnedLinks[link.title]) {
      delete nextPinnedLinks[link.title];
    } else {
      nextPinnedLinks[link.title] = link;
    }

    setStored("pinnedLinks", JSON.stringify(nextPinnedLinks));
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8 flex items-center gap-3">
        <img src="/icons/logo.svg" alt="" className="size-9" />
        <div>
          <h1 className="m-0 text-2xl font-semibold">InNoHassle Tools</h1>
          <p className="mt-0.5 mb-0 text-sm text-base-content/50">
            Extension settings
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-5">
        <OptionBlock
          title="Quick links"
          id="links"
          description={`${pinnedCount} of ${links.length} shown in the popup`}
          action={
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  setStored(
                    "pinnedLinks",
                    JSON.stringify(
                      Object.fromEntries(
                        links.map((link) => [link.title, link]),
                      ),
                    ),
                  )
                }
                className="border-0 bg-transparent p-0 text-sm text-base-content/50 hover:text-base-content"
              >
                Select all
              </button>
              <button
                type="button"
                disabled={pinnedCount === 0}
                onClick={() => setStored("pinnedLinks", "{}")}
                className="border-0 bg-transparent p-0 text-sm text-base-content/50 hover:text-base-content disabled:pointer-events-none disabled:opacity-40"
              >
                Clear
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-2 gap-2 p-5 sm:grid-cols-3">
            {links.map((link) => (
              <LinkSetting
                key={link.href}
                title={link.title}
                className={link.className}
                pinned={!!pinnedLinks[link.title]}
                onClick={() => toggleLink(link)}
              />
            ))}
          </div>
        </OptionBlock>

        <OptionBlock title="Features" id="features">
          <AutologinToggle increased />
        </OptionBlock>

        <AboutSection />
      </div>
    </div>
  );
}
