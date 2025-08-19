import { useLocation } from 'wouter';
import { Shell } from '@/components/shell';

export default function AboutView() {
    const [_, navigate] = useLocation();

    return (
        <Shell className="ccm-pt" onOutsideClick={() => navigate('/')}>
            <aside className="max-w-screen-md ml-auto z-10 relative py-4 ccm-colors ccm-border ccm-rounded ccm-mx ccm-transition">
                <div className="overflow-y-auto ccm-scrollbar max-h-[calc(100vh-7.9rem)] ccm-px pb-10">
                    <div className="flex flex-col gap-8">
                        <h1 className="type-header mb-10">About Unfolding the creative coding landscape</h1>
                        <p>
                            “Unfolding the creative coding landscape” is an interactive platform that maps, connects, and
                            celebrates diverse creative coding frameworks. This living document offers a dynamic visualization of
                            the evolution, relationships, and communities of creative coding tools. Our goal is to empower
                            artists, designers, developers, educators, and newcomers to navigate and contribute to digital
                            creativity. We aim for the project to contribute to a common vocabulary for the creative coding field.
                        </p>
                        <div>
                            <h4 className="type-header">Why creative coding?</h4>
                            <p>
                                Creative coding is the art of using code as a medium for creative expression, exploration, and
                                experimentation. Unlike traditional programming, which focuses on efficiency and reproducibility,
                                creative coding encourages play, discovery, and the pursuit of new artistic forms. Frameworks such
                                as Processing, OPENRNDR, OpenFrameworks, VVVV, and TouchDesigner have become essential tools for
                                digital artists and designers, each shaping the aesthetics and possibilities of code-driven art in
                                unique ways.
                            </p>
                        </div>
                        <div>
                            <h4 className="type-header">How to use it?</h4>
                            <p>
                                The project comprises a central map, an index, and breakdowns. Breakdowns offer detailed
                                descriptions of work through text, images, and code. Navigation of the map is possible via three
                                distinct lenses: domains, frameworks, and use cases. Selecting a node will re-center the map on
                                that node, displaying its description and its relationships to other nodes. A key feature is the
                                creation of 'creative coding routes'. Users can either click the 'create path' button or
                                Shift-click two nodes to reveal the shortest path between those tools or techniques. The
                                connections between individual nodes can also be inspected.
                            </p>
                        </div>
                        <div>
                            <h4 className="type-header">Contribute</h4>
                            <p>
                                This map serves as a starting point and an invitation to contribute to the ever-evolving creative
                                coding landscape. As new tools and techniques constantly emerge and recede, this open-source
                                project on Github welcomes your additions. Whether you're an artist, coder, educator, or simply
                                curious, we encourage you to explore, contribute, and help shape the future of creative coding by
                                submitting new or updated information on tools, breakdowns, and techniques via a pull request.
                            </p>
                        </div>
                        <div className="flex flex-col">
                            <p>Concept, design and back end: RNDR</p>
                            <p>Implementation: Ricardo Matias</p>
                            <p>Thanks to COSA, Processing Foundation, Abe Pazos, Raphaël de Courville, and many more.</p>
                        </div>
                        <div>
                            <h4>Made possible by:</h4>
                            <div className="grid grid-cols-2 gap-x-10 mt-4 ">
                                <img
                                    src="/images/creative-industries-fund-nl.jpg"
                                    alt="Creative Industries Fund NL"
                                    className="h-32"
                                />
                                <img src="/images/4PictorightFonds.jpg" alt="Pictoright Fonds" className="h-32 " />
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </Shell>
    );
}
