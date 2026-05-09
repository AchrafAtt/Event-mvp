import { Head, Link } from '@inertiajs/react';
import { CalendarDays, Gift, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { create as reservationsCreate } from '@/routes/reservations';

type EventType = {
    title: string;
    subtitle: string;
    price: string;
};

type ServiceItem = {
    title: string;
    description: string;
    tag: string;
    icon: LucideIcon;
};

const services = [
    {
        title: 'Evenement',
        description:
            'Organisation complete de votre fete avec decoration personnalisee selon vos couleurs et votre theme prefere.',
        tag: 'Organisation & Decor',
        icon: Sparkles,
    },
    {
        title: 'Location',
        description:
            'Location de mobilier buffet et accessoires de qualite pour sublimer votre reception.',
        tag: 'Mobilier & Accessoires',
        icon: CalendarDays,
    },
    {
        title: 'Pack complet',
        description:
            'Notre offre cle en main: organisation, decoration et mise en place le jour J.',
        tag: 'Cle en main',
        icon: Gift,
    },
] satisfies ServiceItem[];

const eventTypes: EventType[] = [
    {
        title: 'Naissance',
        subtitle: "Celebrez l'arrivee du nouveau bebe",
        price: 'des 1 400 DH',
    },
    {
        title: 'Fiancailles',
        subtitle: 'Un moment romantique et elegant',
        price: 'des 1 200 DH',
    },
    {
        title: 'Acte de mariage',
        subtitle: 'La ceremonie civile en beaute',
        price: 'des 1 600 DH',
    },
    {
        title: 'Fete Henna',
        subtitle: 'La tradition revisitee avec gout',
        price: 'des 2 500 DH',
    },
    {
        title: 'Anniversaire',
        subtitle: 'Chaque anniversaire est unique',
        price: 'des 2 500 DH',
    },
];

const steps = [
    {
        title: 'Choisissez votre service',
        description:
            'Selectionnez la formule adaptee a votre besoin: Evenement, Location ou Pack complet.',
    },
    {
        title: 'Personnalisez votre fete',
        description:
            'Couleurs, style de decoration et accessoires sont ajustes selon vos envies.',
    },
    {
        title: 'Confirmez avec une avance',
        description:
            'Un acompte de 200 DH suffit pour bloquer votre date de reservation.',
    },
    {
        title: 'Profitez de votre evenement',
        description:
            "Notre equipe s'occupe de tout pour vous laisser profiter de chaque instant.",
    },
];

const testimonials = [
    {
        quote: "Ghozel Events a transforme l'anniversaire de ma fille en un vrai conte de fees.",
        author: 'Sara Benali',
        event: 'Anniversaire - Marrakech',
        tag: 'Anniversaire',
    },
    {
        quote: 'Nos fiancailles etaient exactement comme je les avais imaginees. Equipe au top.',
        author: 'Nadia Taher',
        event: 'Fiancailles - Marrakech',
        tag: 'Fiancailles',
    },
    {
        quote: 'Un service impeccable pour notre fete de naissance. Tous les invites ont adore.',
        author: 'Leila Amrani',
        event: 'Naissance - Marrakech',
        tag: 'Naissance',
    },
];

const navLinks = [
    { href: '#services', label: 'Services' },
    { href: '#events', label: 'Evenements' },
    { href: '#how', label: 'Comment ca marche' },
    { href: '#testimonials', label: 'Avis' },
];

function revealDelayClass(index: number): string {
    const mapping = [
        'delay-0',
        'delay-100',
        'delay-200',
        'delay-300',
        'delay-500',
    ];

    return mapping[index] ?? 'delay-0';
}

export default function Welcome() {
    const [activeEventIndex, setActiveEventIndex] = useState(0);
    const [scrolled, setScrolled] = useState(false);

    useScrollReveal();

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    const stats = useMemo(
        () => [
            { value: '168+', label: 'Evenements realises' },
            { value: String(eventTypes.length), label: "Types d'evenements" },
            { value: '100%', label: 'Clients satisfaits' },
        ],
        [],
    );

    return (
        <>
            <Head title="Ghozel Events - Marrakech" />

            <div className="landing-theme bg-bg-global font-['Lato'] text-text-primary">
                <nav
                    className={`fixed top-0 right-0 left-0 z-50 border-b border-border/70 bg-white/90 backdrop-blur-md transition-shadow ${
                        scrolled ? 'shadow-sm' : ''
                    }`}
                >
                    <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-4 md:px-8">
                        <a
                            href="#home"
                            className="font-['Cormorant_Garamond'] text-3xl leading-none font-medium text-text-primary"
                        >
                            Ghozel Events
                        </a>

                        <ul className="hidden items-center gap-8 md:flex">
                            {navLinks.map((item) => (
                                <li key={item.href}>
                                    <a
                                        href={item.href}
                                        className="text-xs tracking-[0.14em] text-text-secondary uppercase transition-colors hover:text-primary"
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        <a
                            href="#contact"
                            className="rounded-full bg-primary px-5 py-2 text-[11px] font-semibold tracking-[0.14em] text-white uppercase transition-colors hover:bg-primary-soft"
                        >
                            Commencer
                        </a>
                    </div>
                </nav>

                <section
                    id="home"
                    className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-bg-card via-bg-global to-white px-4 pt-28 pb-20 md:px-8"
                >
                    <div className="pointer-events-none absolute -top-40 -right-32 h-[38rem] w-[38rem] rounded-full bg-primary/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-36 -left-28 h-[30rem] w-[30rem] rounded-full bg-primary-soft/20 blur-3xl" />

                    <div className="relative mx-auto w-full max-w-4xl text-center">
                        <p
                            data-reveal
                            className="reveal-item mx-auto mb-5 flex items-center justify-center gap-3 text-[11px] tracking-[0.28em] text-accent uppercase"
                        >
                            <span className="block h-px w-10 bg-accent/80" />
                            Marrakech - Evenements sur mesure
                            <span className="block h-px w-10 bg-accent/80" />
                        </p>

                        <h1
                            data-reveal
                            className="reveal-item font-['Cormorant_Garamond'] text-5xl leading-[1.08] font-light text-balance text-text-primary md:text-[6rem]"
                        >
                            Chaque moment
                            <br />
                            merite d&apos;etre{' '}
                            <em className="font-normal text-primary italic">
                                inoubliable
                            </em>
                        </h1>

                        <p
                            data-reveal
                            className="reveal-item mx-auto mt-6 max-w-2xl text-base leading-8 font-light text-text-secondary md:text-lg"
                        >
                            Ghozel Events organise vos celebrations avec
                            elegance et passion, de la naissance aux
                            fiancailles, avec un accompagnement sur mesure.
                        </p>

                        <div
                            data-reveal
                            className="reveal-item mt-10 flex flex-wrap items-center justify-center gap-4"
                        >
                            <Link
                                href={reservationsCreate()}
                                className="rounded-full bg-primary px-10 py-4 text-sm tracking-[0.12em] text-white uppercase shadow-[0_8px_32px_color-mix(in_oklab,var(--color-primary)_38%,transparent)] transition-all hover:-translate-y-0.5 hover:bg-primary-soft hover:shadow-[0_12px_40px_color-mix(in_oklab,var(--color-primary)_44%,transparent)]"
                            >
                                Commencer
                            </Link>
                            <a
                                href="#how"
                                className="rounded-full border border-primary bg-primary px-8 py-4 text-sm tracking-[0.1em] text-white uppercase transition-all hover:bg-primary hover:brightness-90"
                            >
                                Comment ca marche
                            </a>
                        </div>

                        <div
                            data-reveal
                            className="reveal-item mt-16 grid grid-cols-1 gap-6 border-t border-border pt-10 sm:grid-cols-3"
                        >
                            {stats.map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <p className="font-['Cormorant_Garamond'] text-4xl leading-none text-primary md:text-5xl">
                                        {stat.value}
                                    </p>
                                    <p className="mt-2 text-[11px] tracking-[0.14em] text-text-secondary uppercase">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    id="services"
                    className="bg-white px-4 py-20 md:px-8 md:py-24"
                >
                    <div
                        data-reveal
                        className="reveal-item mx-auto mb-14 max-w-3xl text-center"
                    >
                        <p className="text-[11px] tracking-[0.28em] text-primary-soft uppercase">
                            Ce que nous offrons
                        </p>
                        <h2 className="mt-3 font-['Cormorant_Garamond'] text-4xl font-light md:text-6xl">
                            Nos{' '}
                            <em className="font-normal text-primary italic">
                                services
                            </em>
                        </h2>
                        <p className="mt-4 text-base leading-8 font-light text-text-secondary">
                            Trois formules concues pour correspondre a votre
                            vision et votre budget.
                        </p>
                    </div>

                    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
                        {services.map((service, index) => (
                            <article
                                key={service.title}
                                data-reveal
                                className={`reveal-item rounded-xl border border-border bg-bg-global p-8 transition-all hover:-translate-y-1 hover:shadow-xl ${revealDelayClass(index + 1)}`}
                            >
                                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-bg-card text-xl text-primary">
                                    <service.icon className="h-6 w-6" />
                                </div>
                                <h3 className="font-['Cormorant_Garamond'] text-3xl font-medium">
                                    {service.title}
                                </h3>
                                <p className="mt-3 text-sm leading-7 text-text-secondary">
                                    {service.description}
                                </p>
                                <p className="mt-5 inline-flex rounded-full border border-primary-soft px-3 py-1 text-[11px] tracking-[0.1em] text-primary uppercase">
                                    {service.tag}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                <section
                    id="events"
                    className="bg-gradient-to-b from-bg-card to-white px-4 py-20 md:px-8 md:py-24"
                >
                    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
                        <div>
                            <p
                                data-reveal
                                className="reveal-item text-[11px] tracking-[0.28em] text-primary-soft uppercase"
                            >
                                Types d&apos;evenements
                            </p>
                            <h2
                                data-reveal
                                className="reveal-item mt-3 font-['Cormorant_Garamond'] text-4xl leading-tight font-light md:text-6xl"
                            >
                                Pour chaque{' '}
                                <em className="font-normal text-primary italic">
                                    celebration
                                </em>
                            </h2>
                            <p
                                data-reveal
                                className="reveal-item mt-4 max-w-xl text-base leading-8 font-light text-text-secondary"
                            >
                                Nous adaptons chaque prestation a
                                l&apos;occasion avec des forfaits dedies.
                            </p>

                            <div className="mt-8 space-y-2">
                                {eventTypes.map((eventType, index) => {
                                    const active = activeEventIndex === index;

                                    return (
                                        <button
                                            key={eventType.title}
                                            type="button"
                                            onClick={() =>
                                                setActiveEventIndex(index)
                                            }
                                            className={`w-full rounded-xl p-5 text-left transition-all ${
                                                active
                                                    ? 'bg-white shadow-sm'
                                                    : 'hover:bg-white/70'
                                            }`}
                                        >
                                            <span className="flex items-center gap-4">
                                                <span
                                                    className={`h-2 w-2 rounded-full ${
                                                        active
                                                            ? 'bg-primary'
                                                            : 'bg-primary-soft'
                                                    }`}
                                                />
                                                <span>
                                                    <span className="block font-['Cormorant_Garamond'] text-3xl leading-none">
                                                        {eventType.title}
                                                    </span>
                                                    <span className="mt-1 block text-xs text-text-secondary">
                                                        {eventType.subtitle}
                                                    </span>
                                                </span>
                                                <span className="ml-auto font-['Cormorant_Garamond'] text-3xl whitespace-nowrap text-primary">
                                                    {eventType.price}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div
                            data-reveal
                            className="reveal-item relative hidden md:block"
                        >
                            <div className="flex aspect-[4/5] items-center justify-center rounded-3xl bg-gradient-to-br from-bg-card to-primary-soft/30">
                                <p className="text-center text-xs tracking-[0.08em] text-primary/70 uppercase">
                                    ambiance
                                    <br />
                                    evenement
                                </p>
                            </div>
                            <div className="absolute right-[-14px] bottom-8 rounded-2xl bg-white px-5 py-4 shadow-lg">
                                <p className="font-['Cormorant_Garamond'] text-4xl leading-none text-primary">
                                    168
                                </p>
                                <p className="mt-1 text-[11px] tracking-[0.1em] text-text-secondary uppercase">
                                    Evenements
                                    <br />
                                    realises
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="how"
                    className="bg-text-primary px-4 py-20 text-white md:px-8 md:py-24"
                >
                    <div className="mx-auto w-full max-w-6xl">
                        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
                            <div>
                                <p
                                    data-reveal
                                    className="reveal-item text-[11px] tracking-[0.28em] text-primary-soft uppercase"
                                >
                                    Le processus
                                </p>
                                <h2
                                    data-reveal
                                    className="reveal-item mt-3 font-['Cormorant_Garamond'] text-4xl leading-tight font-light md:text-6xl"
                                >
                                    Reserver en{' '}
                                    <em className="font-normal text-primary-soft italic">
                                        4 etapes
                                    </em>
                                </h2>
                            </div>
                            <p
                                data-reveal
                                className="reveal-item max-w-xl text-sm leading-7 text-white/70"
                            >
                                Simple, rapide et entierement en ligne. Votre
                                evenement prend forme en quelques clics.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4">
                            {steps.map((step, index) => (
                                <article
                                    key={step.title}
                                    data-reveal
                                    className={`reveal-item bg-white/8 p-7 ${revealDelayClass(index + 1)}`}
                                >
                                    <p className="font-['Cormorant_Garamond'] text-6xl leading-none text-white/20">
                                        {String(index + 1).padStart(2, '0')}
                                    </p>
                                    <h3 className="mt-4 font-['Cormorant_Garamond'] text-3xl leading-tight">
                                        {step.title}
                                    </h3>
                                    <p className="mt-3 text-sm leading-7 text-white/70">
                                        {step.description}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    id="testimonials"
                    className="bg-white px-4 py-20 md:px-8 md:py-24"
                >
                    <div
                        data-reveal
                        className="reveal-item mx-auto mb-12 max-w-3xl text-center"
                    >
                        <p className="text-[11px] tracking-[0.28em] text-primary-soft uppercase">
                            Ce qu&apos;elles disent
                        </p>
                        <h2 className="mt-3 font-['Cormorant_Garamond'] text-4xl font-light md:text-6xl">
                            Avis de nos{' '}
                            <em className="font-normal text-primary italic">
                                clientes
                            </em>
                        </h2>
                    </div>

                    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
                        {testimonials.map((testimonial, index) => (
                            <article
                                key={testimonial.author}
                                data-reveal
                                className={`reveal-item rounded-xl border border-border bg-bg-global p-8 transition-all hover:-translate-y-1 hover:shadow-lg ${revealDelayClass(index + 1)}`}
                            >
                                <p className="mb-4 text-sm tracking-[0.24em] text-primary-soft">
                                    ★★★★★
                                </p>
                                <p className="font-['Cormorant_Garamond'] text-3xl leading-10 text-text-primary italic">
                                    &quot;{testimonial.quote}&quot;
                                </p>
                                <div className="mt-6 flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-soft to-primary text-sm font-semibold text-white">
                                        {testimonial.author.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">
                                            {testimonial.author}
                                        </p>
                                        <p className="text-xs text-text-secondary">
                                            {testimonial.event}
                                        </p>
                                    </div>
                                    <span className="ml-auto rounded-full bg-bg-card px-3 py-1 text-[11px] tracking-[0.08em] text-primary uppercase">
                                        {testimonial.tag}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section
                    id="contact"
                    className="bg-gradient-to-br from-bg-global to-bg-card px-4 py-20 text-center md:px-8 md:py-24"
                >
                    <div className="mx-auto w-full max-w-3xl">
                        <p
                            data-reveal
                            className="reveal-item text-[11px] tracking-[0.28em] text-primary-soft uppercase"
                        >
                            Pret(e) a commencer ?
                        </p>
                        <h2
                            data-reveal
                            className="reveal-item mt-3 font-['Cormorant_Garamond'] text-4xl leading-tight font-light md:text-6xl"
                        >
                            Reservez votre{' '}
                            <em className="font-normal text-primary italic">
                                evenement
                            </em>{' '}
                            aujourd&apos;hui
                        </h2>
                        <p
                            data-reveal
                            className="reveal-item mx-auto mt-4 max-w-2xl text-base leading-8 font-light text-text-secondary"
                        >
                            Contactez-nous via WhatsApp ou demarrez directement
                            votre reservation.
                        </p>

                        <div
                            data-reveal
                            className="reveal-item mt-10 flex flex-wrap items-center justify-center gap-4"
                        >
                            <a
                                href="https://wa.me/212600000000"
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full bg-success px-8 py-4 text-sm font-semibold tracking-[0.08em] text-white uppercase transition-all hover:-translate-y-0.5 hover:brightness-95"
                            >
                                Contacter sur WhatsApp
                            </a>
                            <Link
                                href={reservationsCreate()}
                                className="rounded-full bg-primary px-8 py-4 text-sm tracking-[0.12em] text-white uppercase transition-colors hover:bg-primary-soft"
                            >
                                Commencer la reservation
                            </Link>
                        </div>

                        <p
                            data-reveal
                            className="reveal-item mt-8 text-sm text-text-secondary"
                        >
                            Avance de reservation: 200 DH - Reponse sous 24h
                        </p>
                    </div>
                </section>

                <footer className="flex flex-col items-center justify-between gap-4 bg-text-primary px-4 py-10 md:flex-row md:px-8">
                    <a
                        href="#home"
                        className="font-['Cormorant_Garamond'] text-3xl text-primary-soft"
                    >
                        Ghozel Events
                    </a>
                    <p className="text-sm text-white/60">
                        © 2026{' '}
                        <span className="text-primary-soft">Ghozel Events</span>{' '}
                        - Marrakech, Maroc
                    </p>
                    <div className="flex items-center gap-6">
                        <a
                            href="#services"
                            className="text-xs tracking-[0.1em] text-white/60 uppercase hover:text-white"
                        >
                            Services
                        </a>
                        <a
                            href="#how"
                            className="text-xs tracking-[0.1em] text-white/60 uppercase hover:text-white"
                        >
                            Reserver
                        </a>
                        <a
                            href="#contact"
                            className="text-xs tracking-[0.1em] text-white/60 uppercase hover:text-white"
                        >
                            Contact
                        </a>
                    </div>
                </footer>
            </div>
        </>
    );
}
