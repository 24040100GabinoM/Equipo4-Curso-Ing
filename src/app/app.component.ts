import { AfterViewInit, Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private readonly DURATION = 4000; // 4 segundos por tarjeta
  private current = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private paused = false;
  private showingA = true;

  private cards: HTMLElement[] = [];
  private dots: HTMLButtonElement[] = [];

  ngAfterViewInit(): void {
    this.cards = Array.from(document.querySelectorAll<HTMLElement>('.card'));
    const heroBgA = document.getElementById('heroBgA');
    if (heroBgA && this.cards[0]) {
      heroBgA.style.backgroundImage = `url("${this.cards[0].dataset['img']}")`;
      heroBgA.classList.add('is-visible');
    }

    const dotsWrap = document.getElementById('dots');
    this.dots = this.cards.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ir a la tarjeta ${i + 1}`);
      dot.addEventListener('click', () => this.activate(i));
      dotsWrap?.appendChild(dot);
      return dot;
    });

    this.cards.forEach((card, i) => {
      card.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.card-btn')) return;
        this.activate(i);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.activate(i);
        }
      });
    });

    document.getElementById('prevBtn')?.addEventListener('click', () => this.activate(this.current - 1));
    document.getElementById('nextBtn')?.addEventListener('click', () => this.activate(this.current + 1));
    document.getElementById('pauseBtn')?.addEventListener('click', () => this.setPaused(!this.paused));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') this.activate(this.current + 1);
      if (e.key === 'ArrowLeft') this.activate(this.current - 1);
    });

    const cardsWrap = document.getElementById('cards');
    cardsWrap?.addEventListener('mouseenter', () => {
      if (this.timer) clearInterval(this.timer);
      document.getElementById('progressBar')?.classList.remove('run');
    });
    cardsWrap?.addEventListener('mouseleave', () => {
      if (!this.paused) {
        this.restartProgress();
        this.startAutoplay();
      }
    });

    this.activate(0);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private restartProgress(): void {
    const bar = document.getElementById('progressBar');
    if (!bar) return;
    bar.classList.remove('run');
    void bar.offsetWidth;
    if (!this.paused) bar.classList.add('run');
  }

  private swapBackground(img: string | undefined): void {
    if (!img) return;
    const a = document.getElementById('heroBgA');
    const b = document.getElementById('heroBgB');
    if (!a || !b) return;
    const show = this.showingA ? b : a;
    const hide = this.showingA ? a : b;
    show.style.backgroundImage = `url("${img}")`;
    show.classList.add('is-visible');
    hide.classList.remove('is-visible');
    this.showingA = !this.showingA;
  }

  private activate(index: number): void {
    if (!this.cards.length) return;
    this.current = (index + this.cards.length) % this.cards.length;
    const card = this.cards[this.current];
    if (!card) return;

    this.cards.forEach((c) => c.classList.remove('is-active'));
    card.classList.add('is-active');
    this.dots.forEach((d, i) => d.classList.toggle('is-active', i === this.current));

    const setText = (id: string, value: string | undefined) => {
      const el = document.getElementById(id);
      if (el && value) el.textContent = value;
    };
    setText('heroNumber', String(this.current + 1).padStart(2, '0'));
    setText('heroName', card.dataset['name']);
    setText('heroRole', card.dataset['role']);
    setText('heroDesc', card.dataset['desc']);

    const heroBtn = document.getElementById('heroBtn') as HTMLAnchorElement | null;
    const cardBtn = card.querySelector<HTMLAnchorElement>('.card-btn');
    if (heroBtn && cardBtn) heroBtn.href = cardBtn.href;

    this.swapBackground(card.dataset['img']);

    const hero = document.querySelector('.hero');
    hero?.classList.remove('swap');
    if (hero) void (hero as HTMLElement).offsetWidth;
    hero?.classList.add('swap');

    this.restartProgress();
    this.startAutoplay();
  }

  private startAutoplay(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.paused) return;
    this.timer = setInterval(() => this.activate(this.current + 1), this.DURATION);
  }

  private setPaused(value: boolean): void {
    this.paused = value;
    const btn = document.getElementById('pauseBtn');
    if (btn) btn.textContent = this.paused ? '▶ Reanudar' : '⏸ Pausar';
    if (this.timer) clearInterval(this.timer);
    if (this.paused) {
      document.getElementById('progressBar')?.classList.remove('run');
    } else {
      this.restartProgress();
      this.startAutoplay();
    }
  }
}
