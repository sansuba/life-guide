import { createContext, ReactNode, useContext, useState } from 'react';

export interface SharedContent {
    text?: string;
    imageUris?: string[];
}

interface ShareContextType {
    sharedContent: SharedContent | null;
    setSharedContent: (content: SharedContent | null) => void;
}

export const ShareContext = createContext<ShareContextType | undefined>(undefined);

export function ShareProvider({ children }: { children: ReactNode }) {
    const [sharedContent, setSharedContent] = useState<SharedContent | null>(null);

    return (
        <ShareContext.Provider value={{ sharedContent, setSharedContent }}>
            {children}
        </ShareContext.Provider>
    );
}

export function useShareContext() {
    const context = useContext(ShareContext);
    if (!context) {
        throw new Error('useShareContext must be used within ShareProvider');
    }
    return context;
}
