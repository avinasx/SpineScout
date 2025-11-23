export default function Footer() {
    return (
        <footer className="fixed bottom-0 left-0 right-0 z-50 bg-base-100 shadow-lg border-t border-base-300">
            <div className="footer footer-center p-4">
                <aside>
                    <p className="text-sm text-base-content/70">
                        © 2026{' '}
                        <a
                            href="https://www.linkedin.com/in/avinash-kumar-shudhanshu-3aa13327/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base-content font-semibold hover:text-primary transition-colors underline"
                        >
                            Avinash
                        </a>
                    </p>
                </aside>
            </div>
        </footer>
    );
}
