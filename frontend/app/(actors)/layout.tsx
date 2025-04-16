import React from "react";

function ActorsHeader() {

    return (
        <header className="flex flex-row items-center justify-between px-12 py-4">
            <h1 className="font-bold text-xl">Logo</h1>

            <div className="flex items-center gap-x-5">
                <div>ACTOR HERE</div>
                <div>SVG PROVIDER HERE</div>
            </div>
        </header>
    );
}

export default function Layout({ children }: React.PropsWithChildren) {
    return (
        <>
            <ActorsHeader />

            <main>{children}</main>
        </>
    )
}