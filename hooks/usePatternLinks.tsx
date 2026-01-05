import { useLinks } from './useLinks';

export const usePatternLinks = (pattern: string | null) => {
    const { links } = useLinks();

    const patternLinks = pattern
        ? links.filter(link => link.pattern === pattern && !link.hidden)
        : links.filter(link => !link.hidden);

    const linksByPattern = links.reduce(
        (acc, link) => {
            if (!link.pattern || link.hidden) return acc;
            if (!acc[link.pattern]) acc[link.pattern] = [];
            acc[link.pattern].push(link);
            return acc;
        },
        {} as Record<string, typeof links>
    );

    return {
        patternLinks,
        linksByPattern,
    };
};
