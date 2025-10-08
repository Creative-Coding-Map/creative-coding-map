import clsx from 'clsx';
import { Link } from 'wouter';
import { navigate, useLocationProperty } from 'wouter/use-browser-location';

export const hashLocation = () => window.location.hash.replace(/^#/, '') || '/';

export const hashNavigate = (to: string) => navigate('#' + to);

export const useHashLocation = () => {
    const location = useLocationProperty(hashLocation);
    return [location, hashNavigate];
};

export const ActiveLink = (props: { href: string; children: React.ReactNode; className?: string }) => {
    return (
        <Link className={(active) => clsx(props.className, active && 'active')} href={props.href}>
            {props.children}
        </Link>
    );
};
