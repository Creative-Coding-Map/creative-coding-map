import { useNavigate } from '@tanstack/react-router';
import { Shell } from '@/components/shell';

export default function About() {
    const navigate = useNavigate();

    return (
        <Shell className="ccm-pt" onOutsideClick={() => navigate({ to: '/' })}>
            <aside className="max-w-screen-md ml-auto z-10 relative ccm-page">
                <div className="w-full">
                    <h1 className="type-header">About Unfolding the coding landscape</h1>
                    <button onClick={() => navigate({ to: '/' })} className="absolute top-4 right-4">
                        Close
                    </button>
                    <p>
                        Lorem Ipsum work deals with people, interaction, time, physical and psychological space and memory - facts
                        and phenomena that he records in a more-or-less abstract fashion. Generally Schlanger deploys cyclic
                        electronic waves as his visual source which he uses to generate amorphous forms that may appeal to the
                        receptive viewer's more primordial consciousness. You watch compositions of rhythmically moving, coloured
                        forms that are in a state of onstant flux. The image and the electronic sound are continually activating
                        each other. Schlanger's oeuvre represents a kind of parallel world where the abstract remains abstract and
                        the riddle is never solved. However, 'Hymn to Ré' differs in a formal sense from the other tapes in this
                        compilation. This extremely short work presents us with images of hieroglyphs while a voice recites from
                        'Hymn to Ré'. This hymn is included in Sir Allan Gardiner's 'Egyptian Grammar' and is originally located
                        on the doorpost of the tomb of the Egyptian General Haremhab. The same applies to all these works: This is
                        not computer graphics! (see: 'Black Dog Dreams')
                    </p>
                    <p>Who made this map: List of names List of names List of names List of names</p>
                    <p>Supported by: Stimuleringfonds and Pictoright</p>
                </div>
            </aside>
        </Shell>
    );
}
