import CloseIcon from '@/components/icons/Close';

export function MobileOverlay({ setShowMobileOverlay }: { setShowMobileOverlay: (show: boolean) => void }) {
    return (
        <div className="fixed inset-0 m-2 h-[calc(100%-1rem)] z-50 bg-background/80 dunkel:bg-black/80 ccm-border ccm-rounded ccm-transition">
            <div className="flex flex-col justify-between items-center h-full p-4">
                <div className="flex items-start">
                    <h1 className="text-2xl font-bold">Unfolding the Creative Coding Landscape</h1>
                    <button className="type-button p-2 " onClick={() => setShowMobileOverlay(false)}>
                        <CloseIcon className="size-10 ccm-icon" />
                    </button>
                </div>
                <p className="">
                    For the best experience, view the creative coding map on a desktop browser to access all features.
                </p>
                <p className="text-sm">
                    <button className="type-button rounded-full ccm-border p-4 mb-8" onClick={() => setShowMobileOverlay(false)}>
                        Continue to the Creative Coding Map
                    </button>
                </p>
            </div>
        </div>
    );
}
