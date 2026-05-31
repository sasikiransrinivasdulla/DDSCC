import * as React from 'react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-border-subtle/60 bg-[#050505] py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border-subtle/30 pb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-widest text-primary-text font-heading">
                DDSCC
              </span>
              <span className="w-1 h-1 rounded-full bg-primary-accent" />
            </div>
            <p className="text-xs text-muted-text mt-2 max-w-xs leading-relaxed">
              Strengthening your placement journey through consistency, discipline, and structured self-growth.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-8 text-xs font-semibold text-muted-text">
            <Link href="/#features" className="hover:text-primary-text transition-colors">
              Discipline Sections
            </Link>
            <Link href="/#philosophy" className="hover:text-primary-text transition-colors">
              Self-Growth Manifesto
            </Link>
            <Link href="/#privacy" className="hover:text-primary-text transition-colors">
              Privacy Standard
            </Link>
            <a 
              href="https://github.com/sasikiransrinivasdulla/DDSCC#readme" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-primary-text hover:text-primary-accent transition-colors duration-300"
            >
              Core Guidelines
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-border-subtle/30">
          <p className="text-xs text-muted-text/80 tracking-wide font-medium">
            Built by the Team —{' '}
            <a 
              href="https://github.com/sasikiransrinivasdulla" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary-text font-semibold hover:text-primary-accent hover:underline decoration-primary-accent/40 decoration-2 transition-all duration-300 inline-block hover:shadow-[0_0_8px_rgba(16,185,129,0.2)]"
            >
              Sasi
            </a>{' '}
            &{' '}
            <a 
              href="https://github.com/roshinichelluri" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary-text font-semibold hover:text-primary-accent hover:underline decoration-primary-accent/40 decoration-2 transition-all duration-300 inline-block hover:shadow-[0_0_8px_rgba(16,185,129,0.2)]"
            >
              Roshini
            </a>
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/sasikiransrinivasdulla/DDSCC" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 text-xs font-semibold text-muted-text hover:text-primary-accent transition-colors duration-300 group"
            >
              <svg 
                className="w-4 h-4 fill-current group-hover:scale-110 transition-transform duration-300"
                viewBox="0 0 24 24" 
                aria-hidden="true"
              >
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              <span>DDSCC Repository</span>
              <svg 
                className="w-3 h-3 text-muted-text/50 group-hover:text-primary-accent transition-colors duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
