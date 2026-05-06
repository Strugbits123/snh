function wixImageUrl(src) {
  if (!src) return null;
  if (typeof src === "string") {
    if (src.startsWith("wix:image://v1/")) {
      const mediaId = src.replace("wix:image://v1/", "").split("/")[0];
      return `https://static.wixstatic.com/media/${mediaId}`;
    }
    return src;
  }
  if (src.url) return src.url;
  if (src.id) return `https://static.wixstatic.com/media/${src.id}`;
  return null;
}

function renderDecorations(text, decorations = []) {
  if (!decorations || decorations.length === 0) return text;

  const bold = decorations.some((d) => d.type === "BOLD");
  const italic = decorations.some((d) => d.type === "ITALIC");
  const underline = decorations.some((d) => d.type === "UNDERLINE");
  const linkDec = decorations.find((d) => d.type === "LINK");

  let el = <>{text}</>;
  if (bold)
    el = <strong className="font-semibold text-foreground">{el}</strong>;
  if (italic) el = <em>{el}</em>;
  if (underline) el = <u>{el}</u>;
  if (linkDec?.linkData?.link?.url) {
    el = (
      <a
        href={linkDec.linkData.link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent underline hover:text-accent/80 transition-colors"
      >
        {el}
      </a>
    );
  }
  return el;
}

function renderInlineNodes(nodes) {
  if (!nodes || nodes.length === 0) return null;
  return nodes.map((child, i) => {
    if (child.type !== "TEXT") return null;
    const { text, decorations } = child.textData || {};
    if (text === undefined || text === null) return null;
    return <span key={i}>{renderDecorations(text, decorations)}</span>;
  });
}

function RenderNode({ node, idx }) {
  if (!node) return null;

  switch (node.type) {
    case "PARAGRAPH": {
      const hasText = node.nodes && node.nodes.some((n) => n.textData?.text);
      if (!hasText) return null;
      return (
        <p key={idx} className="text-base leading-7 text-muted-foreground mb-3">
          {renderInlineNodes(node.nodes)}
        </p>
      );
    }

    case "HEADING": {
      const level = node.headingData?.level || 2;
      const classes = {
        1: "font-display font-bold text-3xl text-foreground mt-8 mb-3",
        2: "font-display font-bold text-2xl text-foreground mt-7 mb-2",
        3: "font-display font-bold text-xl text-foreground mt-6 mb-2",
        4: "font-display font-semibold text-lg text-foreground mt-5 mb-1",
        5: "font-display font-semibold text-base text-foreground mt-4 mb-1",
        6: "font-display font-semibold text-sm text-foreground mt-3 mb-1",
      };
      const Tag = `h${level}`;
      return (
        <Tag key={idx} className={classes[level] || classes[2]}>
          {renderInlineNodes(node.nodes)}
        </Tag>
      );
    }

    case "IMAGE": {
      const { image } = node.imageData || {};
      if (!image?.src) return null;
      const url = wixImageUrl(image.src);
      if (!url) return null;
      const altText = image.altText || "";
      const caption = node.imageData?.caption;

      const w = image.width;
      const h = image.height;
      const aspectStyle = w && h ? { aspectRatio: `${w} / ${h}` } : {};
      return (
        <figure key={idx} className="my-6">
          <img
            src={url}
            alt={altText}
            style={aspectStyle}
            className="w-full rounded-xl object-cover shadow-sm"
            loading="lazy"
          />
          {caption && (
            <figcaption className="text-center text-sm text-muted-foreground mt-2 italic">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "BULLETED_LIST": {
      return (
        <ul key={idx} className="list-disc list-outside ml-5 mb-3 space-y-1">
          {(node.nodes || []).map((item, i) => (
            <RenderListItem key={i} node={item} />
          ))}
        </ul>
      );
    }

    case "ORDERED_LIST": {
      return (
        <ol key={idx} className="list-decimal list-outside ml-5 mb-3 space-y-1">
          {(node.nodes || []).map((item, i) => (
            <RenderListItem key={i} node={item} />
          ))}
        </ol>
      );
    }

    case "BLOCKQUOTE": {
      return (
        <blockquote
          key={idx}
          className="border-l-4 border-accent/50 pl-5 my-5 italic text-muted-foreground"
        >
          {(node.nodes || []).map((child, i) => (
            <RenderNode key={i} node={child} idx={i} />
          ))}
        </blockquote>
      );
    }

    case "DIVIDER": {
      return <hr key={idx} className="my-6 border-border" />;
    }

    case "CODE_BLOCK": {
      const text = (node.nodes || [])
        .flatMap((n) => n.nodes || [n])
        .map((n) => n.textData?.text || "")
        .join("");
      return (
        <pre
          key={idx}
          className="bg-muted rounded-xl p-4 my-5 overflow-x-auto text-sm font-mono text-foreground"
        >
          <code>{text}</code>
        </pre>
      );
    }

    default:
      return null;
  }
}

function RenderListItem({ node }) {
  const paragraphs = (node.nodes || []).filter((n) => n.type === "PARAGRAPH");
  return (
    <li className="text-base leading-7 text-muted-foreground">
      {paragraphs.map((p, i) => (
        <span key={i}>{renderInlineNodes(p.nodes)}</span>
      ))}
    </li>
  );
}

export default function RichContentRenderer({ richContent }) {
  if (!richContent?.nodes || richContent.nodes.length === 0) return null;

  return (
    <div className="rich-content">
      {richContent.nodes.map((node, i) => (
        <RenderNode key={node.id || i} node={node} idx={i} />
      ))}
    </div>
  );
}
