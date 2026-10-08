import images from '../data/images.json';

export default function ResponsiveImage({ src, sizes, prefix = '', variant, ...props }) {
    const image = images[src];
    const srcSet = (variants) => variants?.map((variant) => `${prefix}${variant.url} ${variant.width}w`).join(', ');
    if (variant === 'card' && image?.card) {
        return (
            <picture>
                <source type="image/avif" srcSet={srcSet(image.card.avif)} sizes={sizes} />
                <img {...props} src={`${prefix}${image.card.webp[1].url}`}
                    srcSet={srcSet(image.card.webp)} sizes={sizes}
                    width={480} height={300} decoding="async" />
            </picture>
        );
    }
    return (
        <img
            {...props}
            src={`${prefix}${image?.src ?? src}`}
            srcSet={srcSet(image?.variants)}
            sizes={sizes}
            width={image?.width}
            height={image?.height}
            decoding="async"
        />
    );
}
