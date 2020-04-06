import React from "react";

export const helpHierarchy = [
  {
    slug: "tools",
    displayName: "Tools",
    children: [
      {
        slug: "pencil",
        displayName: "Pencil Tool"
      },
      {
        slug: "brush",
        displayName: "Brush Tool"
      },
      {
        slug: "line",
        displayName: "Line Tool"
      },
      {
        slug: "eraser",
        displayName: "Eraser Tool"
      }
    ]
  },
  {
    slug: "layerPanel",
    displayName: "Layer Panel"
  }
];

const tools = (
  <div>
    <p>
      Tools are things that are tools. Here are some tools:{" "}
      <button name="pencil">pencil</button>,<button name="brush">brush</button>,
      <button name="line">line</button>... and there are more.
    </p>
  </div>
);

const pencil = (
  <div>
    <p>The pencil is a tool that is a pencil. Pencil.</p>
  </div>
);

const brush = (
  <div>
    <p>Brush brush brush tool. Tool.</p>
  </div>
);

const line = (
  <div>
    <p>
      Lorem Ipsum is simply dummy text of the printing and typesetting industry.
      Lorem Ipsum has been the industry's standard dummy text ever since the
      1500s, when an unknown printer took a galley of type and scrambled it to
      make a type specimen book. It has survived not only five centuries, but
      also the leap into electronic typesetting, remaining essentially
      unchanged. It was popularised in the 1960s with the release of Letraset
      sheets containing Lorem Ipsum passages, and more recently with desktop
      publishing software like Aldus PageMaker including versions of Lorem
      Ipsum.
    </p>
  </div>
);

const eraser = (
  <div>
    <p>Eraser stuff.</p>
  </div>
);

const layerPanel = (
  <div>
    <p>Layer Panel stuff.</p>
  </div>
);

export const helpContent = {
  tools,
  pencil,
  brush,
  line,
  eraser,
  layerPanel
};
