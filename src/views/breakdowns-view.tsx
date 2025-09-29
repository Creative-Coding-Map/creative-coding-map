import { useLocation } from 'wouter';
import { Shell } from '@/components/shell';
import { ActionButton } from '@/components/action-button';
import CloseIcon from '@/components/icons/Close';

export default function AboutView() {
    const [_, navigate] = useLocation();

    return (
        <Shell className="ccm-pt" onOutsideClick={() => navigate('/')}>
            <aside className="max-w-screen-md md:ml-auto z-20 relative py-4 ccm-colors ccm-border ccm-rounded ccm-mx ccm-transition">
                <div className="absolute top-4 right-4 z-10">
                    <ActionButton label="Close" onClick={() => navigate('/')}>
                        <CloseIcon className="ccm-icon" />
                    </ActionButton>
                </div>
                <div className="overflow-y-auto ccm-scrollbar max-h-[calc(100dvh-10rem)] md:max-h-[calc(100vh-7.9rem)] ccm-px pb-10">
                    <div className="flex flex-col gap-8">
                        <h1 className="type-header mb-10">Breakdowns</h1>
                        <p>
                            Breakdowns make creative workflows visible and accessible. Instead of only listing tools and
                            techniques, the platform lets you explore how others actually approach their projects, from the first
                            idea to the final code. Step-by-step workflows, annotated snippets, and real-world cases reveal the
                            process in action, helping to demystify creative coding and offer both inspiration and hands-on
                            learning.
                        </p>
                        <p>
                            We are currently gathering these breakdowns from active members of the creative coding community, and
                            will be launching them soon.
                        </p>
                    </div>
                </div>
            </aside>
        </Shell>
    );
}
