import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-particles-background',
  standalone: true,
  templateUrl: './bg.component.html',
  styleUrls: ['./bg.component.css']
})
export class ParticlesBackgroundComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId!: number;
  private readonly colors = ['#FF3F8E', '#04E2FF', '#6F42FF', '#FFC107', '#FF5722'];
  private readonly PARTICLE_COUNT = 80;
  private readonly MIN_SIZE = 2;
  private readonly MAX_SIZE = 6;
  private readonly REPULSION_FORCE = 0.7;
  private readonly FRICTION = 0.98;
  private readonly MIN_SPEED = 0.2;

  ngOnInit(): void {
    this.initCanvas();
    this.createParticles();
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.initCanvas();
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.fillStyle = '#fff'
  }

  private createParticles(): void {
    for (let i = 0; i < this.PARTICLE_COUNT; i++) {
      this.particles.push(new Particle(
        this.canvasRef.nativeElement.width,
        this.canvasRef.nativeElement.height,
        this.colors,
        this.MIN_SIZE,
        this.MAX_SIZE
      ));
    }
  }

  private animate(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].update(this.canvasRef.nativeElement, this.FRICTION, this.MIN_SPEED);
      this.particles[i].draw(this.ctx);
      for (let j = i + 1; j < this.particles.length; j++) {
        this.particles[i].checkCollision(this.particles[j], this.REPULSION_FORCE);
      }
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    for (let i = 0; i < 5; i++) {
      this.particles.push(new Particle(
        this.canvasRef.nativeElement.width,
        this.canvasRef.nativeElement.height,
        this.colors,
        this.MIN_SIZE,
        this.MAX_SIZE,
        event.clientX,
        event.clientY
      ));
    }
  }
}

class Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  opacity: number;
  isDying: boolean;

  constructor(
    canvasWidth: number,
    canvasHeight: number,
    colors: string[],
    minSize: number,
    maxSize: number,
    x?: number,
    y?: number
  ) {
    this.x = x ?? Math.random() * canvasWidth;
    this.y = y ?? Math.random() * canvasHeight;
    this.size = Math.random() * (maxSize - minSize) + minSize;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.speedX = Math.random() * 4 - 2;
    this.speedY = Math.random() * 4 - 2;
    this.opacity = 1;
    this.isDying = false;
  }

  update(canvas: HTMLCanvasElement, friction: number, minSpeed: number): void {
    if (this.isDying) {
      this.opacity -= 0.02;
      this.size *= 0.98;
      if (this.opacity <= 0) this.reset(canvas);
    }

    if (Math.random() < 0.02) {
      this.speedX += (Math.random() - 0.5) * 0.5;
      this.speedY += (Math.random() - 0.5) * 0.5;
    }

    const speed = Math.sqrt(this.speedX ** 2 + this.speedY ** 2);
    if (speed < minSpeed) {
      this.speedX = (this.speedX / speed) * minSpeed;
      this.speedY = (this.speedY / speed) * minSpeed;
    }

    this.x += this.speedX;
    this.y += this.speedY;
    this.speedX *= friction;
    this.speedY *= friction;

    if (this.x <= 0 || this.x >= canvas.width) this.speedX *= -1;
    if (this.y <= 0 || this.y >= canvas.height) this.speedY *= -1;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  reset(canvas: HTMLCanvasElement): void {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.speedX = Math.random() * 4 - 2;
    this.speedY = Math.random() * 4 - 2;
    this.opacity = 1;
    this.isDying = false;
    this.size = Math.random() * (this.size - 2) + 2;
  }

  checkCollision(other: Particle, repulsionForce: number): void {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.size + other.size) {
      this.isDying = true;
      other.isDying = true;

      const angle = Math.atan2(dy, dx);
      const force = repulsionForce * (1 - distance / (this.size + other.size));
      const fx = Math.cos(angle) * force;
      const fy = Math.sin(angle) * force;

      this.speedX += fx;
      this.speedY += fy;
      other.speedX -= fx;
      other.speedY -= fy;
    }
  }
}
