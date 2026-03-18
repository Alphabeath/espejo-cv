export default function Layout({children}: {children: React.ReactNode}) {
    return (
        <section className="flex min-h-svh w-full items-center justify-center px-6 py-8 md:px-10 md:py-10">
            {children}
        </section>
    );
}