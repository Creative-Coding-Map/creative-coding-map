import { Outlet } from '@tanstack/react-router';
import { InfoOverlay } from '@/modules/info-overlay';
import CCMap from '@/modules/map/CCMap';
import { Navbar } from '@/modules/navigation';
import { ActionsOverlay } from '@/modules/actions-overlay';
import { MapOverlay } from '@/modules/map-overlay';

export default function App() {
    return (
        <main className="w-full h-screen relative">
            <Navbar />
            <InfoOverlay />
            <ActionsOverlay />
            <MapOverlay />
            <CCMap />
            <Outlet />
        </main>
    );
}
