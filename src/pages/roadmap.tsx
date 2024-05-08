import Link from "@docusaurus/Link";
import roadmapData from "@site/.docusaurus/roadmap-data/default/roadmap-data.json";

import transitions from "@site/static/transitions.json";
import Layout from "@theme/Layout";
import { AnimatePresence, motion } from "framer-motion";
import React, { RefObject, useState, useEffect } from "react";
import AnimateSpawn from "../components/Common/AnimateSpawn";
import DarkHeroStyles from "../components/Common/DarkHeroStyles";
import ShareMeta from "../components/Common/ShareMeta";
import Overlay from "../components/RoadmapPage/Overlay";
import { RootObject } from "../components/RoadmapPage/RoadmapTypes";

const MotionLink = motion(Link);

const data = roadmapData as RootObject[];

function elementCount(milestoneElements: any[], status: string) {
  return milestoneElements.filter((element) => element.status === status)
    .length;
}

const milestoneComponent = (
  milestone: any, 
  index: number, 
  color: string, 
  overlayTrigger = () => {}
) => {
  const style = { "--color": color } as React.CSSProperties;
  let wrapperClasses = "snap-start text-white rounded-md shrink-0 grow-0 p-8 px-10 flex flex-col min-h-64 scroll-ml-[var(--offcut)]";
  const isOrphan = milestone.name === "orphans_past" || milestone.name === "orphans_future";
  if (isOrphan) {
    wrapperClasses += ` border-2 border-solid border-[var(--color)] order-opacity-20`;
  } else {
    wrapperClasses += ` w-[450px] border-2 border-solid border-[var(--color)]`;
  }

  if (milestone.status === "in_progress") {
    wrapperClasses += ` bg-[var(--color)] w-[450px]`;
  }

  if (milestone.name === "orphans_past") {
    wrapperClasses += ` order-1`;
  } else {
    wrapperClasses += ` order-2`;
  }

  if (milestone.name === "orphans_future") {
    wrapperClasses += ` order-3 mr-[100dvw]`;
  }

  return (
    <article
      key={milestone.name}
      className={wrapperClasses}
      style={style}
      onClick={overlayTrigger}
    >
      {isOrphan ? (
        <div className="grow flex flex-col justify-end">
          <strong className="block text-[120px] font-light leading-none">{milestone.elements!.length}</strong>
          <strong className="">{milestone.name === "orphans_past" ? "Past features" : "Future features"}</strong>
        </div>
      ) : (
        <div className="flex min-h-full gap-20">
          <div className="grow flex flex-col justify-between">
            <header>
              <h2 className="mb-0 tw-heading-4 uppercase">
                {milestone.milestone_id == "none"
                  ? milestoneName(milestone.name)
                  : milestone.milestone_id}
              </h2>
              <p className="text-xs mb-0">
                {milestone.eta && milestone.eta != "none" ? (
                  <span>
                    <span className="opacity-35">Milestone</span> {milestone.eta}
                  </span>
                ) : (
                  <span>&nbsp;</span>
                )}
              </p>
            </header>
            <p className="mb-0 mt-3">{milestoneName(milestone.name)}</p>
          </div>
          <div className="self-end">
            <strong className="block text-[120px] font-light leading-none text-right">{milestone.elements!.length}</strong>
            <strong>Feature{milestone.elements!.length > 1 ? 's' : ''}</strong>
          </div>
        </div>
      )}
    </article>
  );
};

function milestoneName(name: string) {
  let title = name;
  if (name == "orphans_past") {
    title = "Previous Tasks";
  } else if (name == "orphans_future") {
    title = "Future";
  }
  return title;
}

function indexToColor(index: number, total: number, relI) {
  const hueStart = -30;
  const hueRange = 200;
  const relativeIndex = index / total;
  const hue = (relativeIndex * -hueRange + hueStart) % 360;
  /*if (!relI) {*/
    return `hsl(${hue.toFixed(2)} 40% 25%)`;
  /*} else {
    return `hsl(${hue} ${30 + relI * 20}% ${25 - relI * 20}%)`;
  }*/
}

function scrollBy(ref: RefObject<T>, direction: 1) {
  const element = ref.current;
  element.scrollBy({
    left: (window.innerWidth / 4) * direction,
    behavior: "smooth",
  });
}

function elementHasOverflown(element: HTMLElement) {
  return element.scrollWidth > element.clientWidth;
}

const RoadmapPage: React.FC = () => {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayOpenAt, setOverlayOpenAt] = useState(0);
  const [overlayAnchor, setOverlayAnchor] = useState(null);

  const scrollRefs = new Array(data.length)
    .fill("")
    .map((_) => React.useRef(null));

  function openOverlay(at: number, anchor: number | null = null) {
    document.body.style.overflow = "hidden";
    setOverlayOpenAt(at);
    setOverlayAnchor(anchor);
    setOverlayOpen(true);
  }

  function closeOverlay() {
    document.body.style.overflow = "";
    setOverlayOpen(false);
  }

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      scrollRefs.forEach((ref) => {
        const controls = ref.current.parentElement.querySelectorAll(
          "[data-slidecontrol]"
        );
        if (elementHasOverflown(ref.current)) {
          controls.forEach((el: HTMLElement) => {
            el.classList.remove("hidden");
          });
        } else {
          controls.forEach((el: HTMLElement) => {
            el.classList.add("hidden");
          });
        }
      });
    });

    observer.observe(document.documentElement);

    return () => {
      observer.unobserve(document.documentElement);
    };
  }, []);

  return (
    <Layout
      title="Roadmap"
      description="This roadmap shows the status of many projects across the Internet Computer stack, but not all - more to come over the next few weeks."
      editPath="https://github.com/dfinity/portal/tree/master/roadmap"
    >
      <ShareMeta image="/img/shareImages/share-roadmap.jpeg"></ShareMeta>

      <main className={"w-full overflow-hidden bg-[#0a0023] text-white"}>
        <section className="">
          <DarkHeroStyles bgColor="#0a0023"></DarkHeroStyles>
          <div className="container-10 pt-12 mb-60 md:mb-52 md:pt-36 relative">
            <div className="md:w-7/10">
              <h1 className="tw-heading-3 md:tw-heading-2 mb-6">Roadmap</h1>
              <p className="tw-lead-sm md:tw-lead mb-0">
                The DFINITY Foundation is committing R&D resources in various
                domains of development with the intent of making the Internet
                Computer blockchain more efficient, faster and easier to use.
                This roadmap shows the status of many projects across the
                Internet Computer stack, but not all - more to come over the
                next few weeks.
              </p>
            </div>
          </div>
        </section>

        <section className="-mt-52 md:-mt-32 relative  mb-40">
          {data.map((theme, indexTheme) => (
            <article key={theme.name} className="mt-20">
              <header class="container-10">
                <h1 className="tw-heading-3">{theme.name}</h1>
                <p className="tw-paragraph max-w-sm opacity-60">
                  {theme.description}
                </p>
              </header>

              <button
                data-slidecontrol
                onClick={scrollBy.bind(null, scrollRefs[indexTheme], -1)}
              >
                prev{" "}
              </button>
              <button
                data-slidecontrol
                onClick={scrollBy.bind(null, scrollRefs[indexTheme], 1)}
              >
                next{" "}
              </button>
              <div className="
                relative

                after:content-['']
                after:bg-[#0a0023]
                after:absolute
                after:bottom-0
                after:h-[30px]
                after:left-0
                after:right-0
              ">
                <section
                  ref={scrollRefs[indexTheme]}
                  data-scroll={indexTheme}
                  aria-label="milestones"
                  className="flex gap-6 items-stretch overflow-x-auto snap-mandatory snap-x mt-8 pb-12 w-full scrollbar-hide box-border pl-[var(--offcut)] pr-[var(--offcut)]"
                  style={{
                    scrollbarWidth: "none",
                    '--offcut': 'max(0rem, calc((100dvw - 1214px) / 2 + 50px))',
                  } as React.CSSProperties}
                >
                  {theme.milestones.map(
                    (milestone, index) =>
                      milestone.elements.length > 0 && milestoneComponent(
                        milestone, 
                        index, 
                        indexToColor(
                          indexTheme,
                          data.length,
                          index / theme.milestones.length
                        ),
                        () => openOverlay(indexTheme, index)
                      )
                  )}
                </section>
              </div>
            </article>
          ))}
        </section>
        {overlayOpen && (
          <Overlay
            onClose={closeOverlay}
            openAt={overlayOpenAt}
            data={data}
            anchor={overlayAnchor}
          ></Overlay>
        )}
      </main>
    </Layout>
  );
};

export default RoadmapPage;
