import images from '../data/images.json';

function buildSrcSet(prefix, stem, widths, suffix, ext) {
    return widths?.map((w) => `${prefix}img/optimized/${stem}${suffix}-${w}.${ext} ${w}w`).join(', ');
}

export default function ResponsiveImage({ src, sizes, prefix = '', variant, ...props }) {
    const image = images[src];
    if (variant === 'card' && image?.c?.length) {
        const fallbackWidth = image.c.includes(480) ? 480 : image.c[0];
        return (
            <picture>
                <source type="image/avif" srcSet={buildSrcSet(prefix, image.s, image.c, '-card', 'avif')} sizes={sizes} />
                <img
                    {...props}
                    src={`${prefix}img/optimized/${image.s}-card-${fallbackWidth}.webp`}
                    srcSet={buildSrcSet(prefix, image.s, image.c, '-card', 'webp')}
                    sizes={sizes}
                    width={480}
                    height={300}
                    decoding="async"
                />
            </picture>
        );
    }
    const preferredWidth = image?.v?.find((w) => w >= 800) ?? image?.v?.at(-1);
    const resolvedSrc = image && preferredWidth ? `img/optimized/${image.s}-${preferredWidth}.webp` : src;
    return (
        <img
            {...props}
            src={`${prefix}${resolvedSrc}`}
            srcSet={image ? buildSrcSet(prefix, image.s, image.v, '', 'webp') : undefined}
            sizes={sizes}
            width={image?.w}
            height={image?.h}
            decoding="async"
        />
    );
}
