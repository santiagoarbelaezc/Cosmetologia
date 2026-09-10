import { Component, inject, signal, computed, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppointmentService } from '../../core/services/appointment.service';
import { PublicService, Appointment } from '../../core/models/appointment.model';
import { CurrencyCopPipe } from '../../shared/pipes/currency-cop.pipe';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyCopPipe],
  template: `
    <div class="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-500 selection:text-black">
      
      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- NAVBAR SUPERIOR PREMIUM CON AMBIENTE MANTRA               -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <header class="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80">
        <div class="max-w-[1500px] mx-auto px-4 sm:px-10 lg:px-16 h-20 sm:h-22 flex items-center justify-between">
          
          <!-- Brand Typographic Identity (Sin Imagen de Logo) -->
          <a routerLink="/" class="flex flex-col justify-center group min-w-0 pr-2">
            <span class="font-black text-lg sm:text-2xl tracking-tight text-white block leading-tight group-hover:text-amber-300 transition-colors uppercase truncate">
              MANTRA GROUP
            </span>
            <span class="text-[9px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-amber-500 font-bold block mt-0.5 truncate">
              Centro Estético Corporal y Facial
            </span>
          </a>

          <!-- Desktop Quick Navigation & Staff Access (Hidden on < md) -->
          <div class="hidden md:flex items-center gap-5 sm:gap-7">
            <nav class="flex items-center gap-7 text-xs sm:text-sm font-semibold tracking-wide text-zinc-400">
              <a href="#servicios" class="hover:text-amber-300 transition-colors">Procedimientos</a>
              <a href="#concepto" class="hover:text-amber-300 transition-colors">Espacio Mantra</a>
              <a href="#especialistas" class="hover:text-amber-300 transition-colors">Especialistas</a>
            </nav>

            <button
              type="button"
              (click)="openBookingModal()"
              class="rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs sm:text-sm font-semibold px-5 sm:px-6 py-2.5 transition-colors cursor-pointer active:scale-[0.98]"
            >
              Agendar Cita
            </button>

            <a
              routerLink="/login"
              class="text-xs sm:text-sm font-medium text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 rounded-full px-4 py-2 transition-colors"
            >
              Portal Staff →
            </a>
          </div>

          <!-- Mobile Actions (< md) -->
          <div class="flex md:hidden items-center gap-2">
            <button
              type="button"
              (click)="openBookingModal()"
              class="rounded-full bg-amber-400 text-zinc-950 text-xs font-bold px-3.5 py-2 transition-colors cursor-pointer active:scale-95"
            >
              Cita
            </button>

            <button
              type="button"
              (click)="toggleMobileMenu()"
              class="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center cursor-pointer active:scale-95"
              title="Menú"
            >
              @if (!isMobileMenuOpen()) {
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              } @else {
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
            </button>
          </div>

        </div>

        <!-- Mobile Drawer Menu (< md) -->
        @if (isMobileMenuOpen()) {
          <div class="md:hidden border-t border-zinc-800/80 bg-zinc-950/98 px-5 py-5 space-y-4 animate-slide-up">
            <nav class="flex flex-col space-y-2.5 text-sm font-medium text-zinc-300">
              <a
                href="#servicios"
                (click)="isMobileMenuOpen.set(false)"
                class="p-2.5 rounded-xl hover:bg-zinc-900 hover:text-amber-400 transition-colors"
              >
                ✦ Procedimientos Estéticos
              </a>
              <a
                href="#concepto"
                (click)="isMobileMenuOpen.set(false)"
                class="p-2.5 rounded-xl hover:bg-zinc-900 hover:text-amber-400 transition-colors"
              >
                ✦ Espacio & Concepto Mantra
              </a>
              <a
                href="#especialistas"
                (click)="isMobileMenuOpen.set(false)"
                class="p-2.5 rounded-xl hover:bg-zinc-900 hover:text-amber-400 transition-colors"
              >
                ✦ Equipo Clínico Especialista
              </a>
            </nav>

            <div class="pt-3 border-t border-zinc-800/80 flex flex-col gap-2.5">
              <button
                type="button"
                (click)="isMobileMenuOpen.set(false); openBookingModal()"
                class="w-full rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold py-3 text-center transition-colors cursor-pointer"
              >
                Agendar Cita Online
              </button>
              <a
                routerLink="/login"
                (click)="isMobileMenuOpen.set(false)"
                class="w-full rounded-full border border-zinc-800 text-zinc-400 hover:text-white text-xs font-medium py-2.5 text-center transition-colors"
              >
                Portal Staff Clínico →
              </a>
            </div>
          </div>
        }
      </header>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- HERO SOFISTICADO: FOTOGRAFÍA HD Y HALO MANTRA             -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <section class="relative py-10 sm:py-20 lg:py-24 px-4 sm:px-10 lg:px-16 max-w-[1500px] mx-auto w-full overflow-hidden">
        
        <!-- Ambient Warm Glow Background -->
        <div class="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div class="absolute bottom-10 left-10 w-80 h-80 bg-amber-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          <!-- Text Column (Minimalist & High-Impact) -->
          <div class="lg:col-span-6 space-y-5 sm:space-y-6" data-aos="fade-up" data-aos-duration="800">
            
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Sede Exclusiva · Mantra Group</span>
            </div>

            <div class="space-y-2.5 sm:space-y-3">
              <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] sm:leading-[1.06]">
                Centro Estético <br />
                <span class="text-amber-400">
                  Corporal y Facial.
                </span>
              </h1>
              <p class="text-sm sm:text-lg text-zinc-400 font-normal leading-relaxed max-w-xl">
                Armonización de vanguardia, tecnología médica y remodelación corporal en un ambiente concebido para la serenidad y la precisión clínica.
              </p>
            </div>

            <!-- Features Highlights (Micro Badges) -->
            <div class="grid grid-cols-3 gap-2 sm:gap-3 pt-1 sm:pt-2">
              <div class="p-2.5 sm:p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80">
                <span class="text-amber-400 text-xs sm:text-sm font-black block">7</span>
                <span class="text-[9.5px] sm:text-[11px] font-semibold text-zinc-400 block mt-0.5 leading-tight">Procedimientos</span>
              </div>
              <div class="p-2.5 sm:p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80">
                <span class="text-amber-400 text-xs sm:text-sm font-black block">100%</span>
                <span class="text-[9.5px] sm:text-[11px] font-semibold text-zinc-400 block mt-0.5 leading-tight">Biocompatible</span>
              </div>
              <div class="p-2.5 sm:p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80">
                <span class="text-amber-400 text-xs sm:text-sm font-black block">Lun - Sáb</span>
                <span class="text-[9.5px] sm:text-[11px] font-semibold text-zinc-400 block mt-0.5 leading-tight">8am - 4pm</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                type="button"
                (click)="openBookingModal()"
                class="rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 text-sm font-semibold px-7 py-3.5 transition-colors cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Agendar Cita Online</span>
                <span>→</span>
              </button>
              <a
                href="#servicios"
                class="rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-sm font-medium px-6 py-3.5 transition-colors text-center"
              >
                Explorar Tratamientos
              </a>
            </div>

          </div>

          <!-- Hero Image Column: HD Clinic Interior with Backlit Lotus Sign -->
          <div class="lg:col-span-6" data-aos="fade-left" data-aos-duration="1000" data-aos-delay="150">
            <div class="relative group rounded-3xl overflow-hidden border border-zinc-800/90 shadow-2xl bg-zinc-900">
              
              <!-- Subtle Golden Rim Light Effect -->
              <div class="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-transparent opacity-50 blur-lg pointer-events-none"></div>

              <!-- Main High Definition Clinic Interior Photo -->
              <div class="relative aspect-[4/3] sm:aspect-[16/11] overflow-hidden">
                <img
                  src="/images/mantra_clinic.jpg"
                  alt="Instalaciones Mantra Group"
                  class="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700"
                />
                
                <!-- Luxury Vignette Gradient -->
                <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>

                <!-- Floating Glassmorphism Badge Bottom -->
                <div class="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3 min-w-0">
                    <img
                      src="/images/mantra_logo.jpg"
                      alt="Logo Medallón Mantra"
                      class="w-9 h-9 rounded-full object-cover border border-amber-400/40 shadow-xs flex-shrink-0"
                    />
                    <div class="min-w-0">
                      <p class="text-xs font-bold text-white tracking-tight truncate">Recepción & Suites Clínicas</p>
                      <p class="text-[10.5px] text-amber-400/90 font-medium truncate">Mantra Group · Flor de Loto & Madera Flotante</p>
                    </div>
                  </div>

                  <a
                    href="#concepto"
                    class="text-[11px] font-bold text-zinc-300 hover:text-white underline decoration-amber-400/60 flex-shrink-0"
                  >
                    Ver Sede
                  </a>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- CARRUSEL MINIMALISTA DE LOS 7 PROCEDIMIENTOS ESTÉTICOS   -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <section id="servicios" class="py-14 sm:py-20 px-4 sm:px-10 lg:px-16 max-w-[1500px] mx-auto w-full border-t border-zinc-900" data-aos="fade-up">
        
        <!-- Header Minimalista y Limpio -->
        <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span class="uppercase tracking-[0.22em] text-[10.5px] font-bold text-amber-400">
                LOS 7 PROCEDIMIENTOS MANTRA
              </span>
            </div>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Procedimientos Estéticos
            </h2>
          </div>

          <!-- Controles y Contador -->
          <div class="flex items-center gap-4">
            <span class="text-xs font-mono font-bold tracking-wider text-zinc-400">
              <strong class="text-amber-400">0{{ currentSlide() + 1 }}</strong> / 0{{ carouselSlides.length }}
            </span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="prevSlide()"
                class="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-zinc-800 hover:border-amber-400/60 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all flex items-center justify-center cursor-pointer active:scale-95"
                title="Anterior"
              >
                ←
              </button>
              <button
                type="button"
                (click)="nextSlide()"
                class="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-zinc-800 hover:border-amber-400/60 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all flex items-center justify-center cursor-pointer active:scale-95"
                title="Siguiente"
              >
                →
              </button>
            </div>
          </div>
        </div>

        <!-- Gran Carrusel de Imagen Expansiva (Cinemático, Minimalista, Sin Precio) -->
        <div class="relative w-full h-[520px] sm:h-[620px] lg:h-[720px] rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800/80 shadow-2xl group">
          @for (slide of carouselSlides; track slide.id; let idx = $index) {
            <div
              class="absolute inset-0 transition-opacity duration-700 ease-in-out"
              [ngClass]="idx === currentSlide() ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'"
            >
              <!-- Imagen Grande en Alta Definición -->
              <img
                [src]="slide.image"
                [alt]="slide.title"
                class="w-full h-full object-cover object-center group-hover:scale-[1.015] transition-transform duration-700"
              />

              <!-- Degradados Cinemáticos Suaves para Legibilidad -->
              <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/35 to-transparent"></div>
              <div class="absolute inset-0 bg-gradient-to-r from-zinc-950/70 via-transparent to-transparent"></div>

              <!-- Badge Superior Minimalista: Número y Protocolo -->
              <div class="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center gap-2">
                <span class="px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/30">
                  0{{ idx + 1 }} · {{ slide.category }}
                </span>
                <span class="px-2.5 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold bg-black/50 backdrop-blur-md text-zinc-300 border border-white/10">
                  {{ slide.duration }}
                </span>
              </div>

              <!-- Indicadores de Puntos en la Esquina Superior Derecha -->
              <div class="absolute top-5 right-5 sm:top-8 sm:right-8 z-20 flex items-center gap-1.5">
                @for (s of carouselSlides; track s.id; let dotIdx = $index) {
                  <button
                    type="button"
                    (click)="setSlide(dotIdx)"
                    class="h-1.5 rounded-full transition-all cursor-pointer"
                    [ngClass]="dotIdx === currentSlide() ? 'w-7 sm:w-9 bg-amber-400' : 'w-1.5 bg-white/40 hover:bg-white/75'"
                    [title]="s.title"
                  ></button>
                }
              </div>

              <!-- Contenido Inferior: Título Limpio, Tagline y Botón Agendar (Sin Precio) -->
              <div class="absolute bottom-6 left-5 right-5 sm:bottom-12 sm:left-12 sm:right-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div class="max-w-2xl space-y-2 sm:space-y-3">
                  <div class="flex items-center gap-2 text-amber-400 text-[10.5px] sm:text-xs font-bold tracking-widest uppercase">
                    <span>Protocolo Clínico Exclusivo</span>
                    <span>·</span>
                    <span>Mantra Group</span>
                  </div>
                  <h3 class="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                    {{ slide.title }}
                  </h3>
                  <p class="text-zinc-300 text-xs sm:text-base font-normal max-w-xl leading-relaxed">
                    {{ slide.tagline }}
                  </p>
                </div>

                <div class="flex-shrink-0">
                  <button
                    type="button"
                    (click)="openBookingWithServiceId(slide.id)"
                    class="rounded-full bg-white hover:bg-zinc-100 text-zinc-950 text-xs sm:text-sm font-semibold px-6 sm:px-8 py-3 sm:py-3.5 transition-all cursor-pointer flex items-center gap-2.5 active:scale-[0.98] shadow-lg"
                  >
                    <span>Agendar Cita</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Selector Minimalista de los 7 Procedimientos (Píldoras de Navegación del Carrusel) -->
        <div class="mt-6 sm:mt-8 flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          @for (s of carouselSlides; track s.id; let i = $index) {
            <button
              type="button"
              (click)="setSlide(i)"
              class="flex-shrink-0 px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-full text-xs transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap border"
              [ngClass]="i === currentSlide()
                ? 'bg-amber-400 text-zinc-950 border-amber-400 font-bold shadow-sm'
                : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700 font-medium'"
            >
              <span class="font-mono text-[10.5px]" [ngClass]="i === currentSlide() ? 'text-zinc-950 font-black' : 'text-zinc-500'">
                0{{ i + 1 }}
              </span>
              <span>{{ s.shortTitle }}</span>
            </button>
          }
        </div>

      </section>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- CONCEPTO & ESPACIO MANTRA (LUXURY ARCHITECTURAL AMBIENCE) -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <section id="concepto" class="py-14 sm:py-20 px-6 sm:px-10 lg:px-16 max-w-[1500px] mx-auto w-full border-t border-zinc-800/80" data-aos="fade-up">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span class="uppercase tracking-widest text-[11px] font-bold text-amber-400">INSTALACIONES & IDENTIDAD</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Espacio Mantra Group
            </h2>
          </div>
          <span class="text-xs text-zinc-400">Ambiente cálido de diseño contemporáneo, iluminación LED halo y máxima privacidad</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <!-- Card 1: Halo Lotus Medallion -->
          <div class="group rounded-3xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden hover:border-amber-400/40 transition-all duration-300 flex flex-col">
            <div class="relative w-full h-[380px] sm:h-[440px] overflow-hidden bg-zinc-950">
              <img
                src="/images/mantra_logo.jpg"
                alt="Medallón Flor de Loto Mantra"
                class="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
              <div class="absolute top-4 left-4">
                <span class="px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-amber-300 border border-amber-400/30">
                  Flor de Loto Dorada
                </span>
              </div>
            </div>
            <div class="p-6 sm:p-7 space-y-2">
              <h3 class="text-xl font-bold text-white tracking-tight">
                Emblema Mantra Group
              </h3>
              <p class="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
                El medallón iluminado con halo cálido representa la armonía, pureza estética y serenidad en cada protocolo.
              </p>
            </div>
          </div>

          <!-- Card 2: Clinic Reception with Fluted Wood Panel -->
          <div class="group rounded-3xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden hover:border-amber-400/40 transition-all duration-300 flex flex-col">
            <div class="relative w-full h-[380px] sm:h-[440px] overflow-hidden bg-zinc-950">
              <img
                src="/images/mantra_clinic.jpg"
                alt="Recepción y madera flautada Mantra"
                class="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
              <div class="absolute top-4 left-4">
                <span class="px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-amber-300 border border-amber-400/30">
                  Arquitectura & Confort
                </span>
              </div>
            </div>
            <div class="p-6 sm:p-7 space-y-2">
              <h3 class="text-xl font-bold text-white tracking-tight">
                Instalaciones Clínicas
              </h3>
              <p class="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
                Madera acústica acanalada, mobiliario minimalista y suites privadas equipadas con aparatología de última generación.
              </p>
            </div>
          </div>

        </div>
      </section>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- ESPECIALISTAS CON IMÁGENES ANCHAS & MINIMALISTAS          -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <section id="especialistas" class="py-14 sm:py-20 px-6 sm:px-10 lg:px-16 max-w-[1500px] mx-auto w-full border-t border-zinc-800/80" data-aos="fade-up">
        <div class="flex flex-col sm:flex-row sm:items-baseline justify-between mb-10 gap-2">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span class="uppercase tracking-widest text-[11px] font-bold text-amber-400">EQUIPO CLÍNICO</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-black tracking-tight text-white">Especialistas Mantra</h2>
          </div>
          <span class="text-xs text-zinc-400">Profesionales certificados con registro médico legal</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          @for (doc of specialists; track doc.id) {
            <div class="group rounded-3xl border border-zinc-800/80 bg-zinc-900/70 overflow-hidden hover:border-amber-400/40 hover:shadow-2xl transition-all duration-300 flex flex-col" data-aos="fade-up">
              
              <!-- Wide, High-Definition Photo Banner -->
              <div class="relative w-full h-[460px] sm:h-[520px] lg:h-[580px] overflow-hidden bg-zinc-950">
                <img
                  [src]="doc.photoUrl"
                  [alt]="doc.name"
                  class="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                />
                
                <!-- Floating Category Badge -->
                <div class="absolute top-4 left-4">
                  <span class="px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-zinc-950/90 backdrop-blur-md text-amber-300 border border-amber-400/30">
                    {{ doc.role }}
                  </span>
                </div>
              </div>

              <!-- Minimalist Doctor Information Below Photo -->
              <div class="p-6 sm:p-7 space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 class="text-2xl font-black text-white tracking-tight">
                      {{ doc.name }}
                    </h3>
                    <p class="text-xs font-semibold text-zinc-400 mt-1">
                      {{ doc.title }}
                    </p>
                  </div>

                  <button
                    type="button"
                    (click)="openBookingWithSpecialist(doc.id)"
                    class="rounded-full bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold px-5 py-2.5 transition-colors cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0 self-start sm:self-center active:scale-[0.98]"
                  >
                    <span>Agendar Cita</span>
                    <span>→</span>
                  </button>
                </div>

                <!-- Procedures Pills -->
                <div class="flex flex-wrap gap-1.5 pt-1">
                  @for (proc of doc.keyProcedures; track proc) {
                    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                      {{ proc }}
                    </span>
                  }
                </div>
              </div>

            </div>
          }
        </div>
      </section>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- FOOTER & HORARIOS                                         -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <footer id="horarios" class="mt-auto py-12 px-6 sm:px-10 lg:px-16 bg-black border-t border-zinc-800/80 text-xs text-zinc-400" data-aos="fade">
        <div class="max-w-[1500px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          
          <div class="flex items-center gap-4">
            <img
              src="/images/mantra_logo.jpg"
              alt="Mantra Group"
              class="w-12 h-12 rounded-full object-cover border border-amber-400/40 shadow-sm"
            />
            <div class="space-y-1">
              <p class="font-black text-white text-base tracking-tight">MANTRA GROUP</p>
              <p class="text-[11px] uppercase tracking-widest text-amber-500 font-bold">Centro Estético Corporal y Facial</p>
              <p class="text-zinc-500">Horario: Lunes a Sábado · 8:00 a.m. a 4:00 p.m. · WhatsApp: +57 (310) 456-7890</p>
            </div>
          </div>

          <div class="flex items-center gap-5 text-xs font-semibold">
            <button (click)="openBookingModal()" class="text-amber-400 hover:text-amber-300 underline cursor-pointer">
              Agendar Cita Online
            </button>
            <span class="text-zinc-700">·</span>
            <a routerLink="/login" class="text-zinc-400 hover:text-white">
              Portal Staff →
            </a>
          </div>

        </div>
      </footer>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- MODAL DE AGENDAMIENTO EN 5 PASOS (LOS 7 PROCEDIMIENTOS)   -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- MODAL DE AGENDAMIENTO EN 5 PASOS (LOS 7 PROCEDIMIENTOS)   -->
      <!-- ═════════════════════════════════════════════════════════ -->
      @if (showBookingModal()) {
        <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div class="w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[94vh] sm:max-h-[92vh] overflow-y-auto p-4 sm:p-8 lg:p-10 bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl space-y-5 sm:space-y-7 animate-slide-up border border-zinc-800 text-zinc-100">
            
            <!-- Modal Header with Progress Step indicator -->
            <div class="flex items-start justify-between border-b border-zinc-800 pb-3 sm:pb-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Paso {{ currentStep() }} de 5
                  </span>
                  <span class="text-xs text-zinc-400">Reserva de Cita · Mantra Group</span>
                </div>
                <h3 class="text-base sm:text-2xl font-black text-white tracking-tight">
                  {{ getStepTitle(currentStep()) }}
                </h3>
              </div>

              <button
                type="button"
                (click)="closeBookingModal()"
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            <!-- Steps Progress Bar -->
            <div class="grid grid-cols-5 gap-1.5 pb-1 sm:pb-2">
              @for (step of [1, 2, 3, 4, 5]; track step) {
                <div
                  class="h-1.5 rounded-full transition-all duration-300"
                  [ngClass]="currentStep() >= step ? 'bg-amber-400' : 'bg-zinc-800'"
                ></div>
              }
            </div>

            <!-- ─── PASO 1: SELECCIÓN DE PROCEDIMIENTO & ESPECIALISTA ─── -->
            @if (currentStep() === 1) {
              <div class="space-y-5 sm:space-y-7 animate-fade-in">
                <div>
                  <div class="flex items-center justify-between mb-3 sm:mb-4">
                    <div>
                      <label class="text-xs font-bold uppercase tracking-wider text-amber-400 block">1. Selecciona tu Tratamiento</label>
                      <p class="text-xs text-zinc-400 mt-0.5">Elige uno de los 7 procedimientos estéticos de Mantra Group</p>
                    </div>
                    <span class="text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                      7 Opciones
                    </span>
                  </div>

                  <!-- 7 Tratamientos en Grilla Adaptativa -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
                    @for (s of bookingServices; track s.id) {
                      <button
                        type="button"
                        (click)="bookingForm.serviceId = s.id"
                        class="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2.5 sm:space-y-3 group relative overflow-hidden"
                        [ngClass]="bookingForm.serviceId === s.id ? 'bg-zinc-950 text-white border-amber-400 shadow-lg ring-1 sm:ring-2 ring-amber-400/30' : 'bg-zinc-900/90 hover:bg-zinc-800/80 border-zinc-800 text-zinc-200'"
                      >
                        <!-- Top Badges & Selection Indicator -->
                        <div class="flex items-center justify-between gap-2 w-full">
                          <span class="px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider"
                                [ngClass]="bookingForm.serviceId === s.id ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-zinc-300'">
                            {{ s.categoryLabel || s.category }}
                          </span>
                          
                          <div class="flex items-center gap-2">
                            <span class="text-[11px] sm:text-xs text-zinc-400 font-medium">
                              {{ s.durationMinutes }} min
                            </span>

                            <div class="w-4 h-4 rounded-full border flex items-center justify-center transition-all"
                                 [ngClass]="bookingForm.serviceId === s.id ? 'border-amber-400 bg-amber-400 text-zinc-950' : 'border-zinc-700 bg-zinc-800'">
                              @if (bookingForm.serviceId === s.id) {
                                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="3.5" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              }
                            </div>
                          </div>
                        </div>

                        <!-- Content -->
                        <div class="space-y-1">
                          <h4 class="text-sm sm:text-base font-bold leading-snug tracking-tight text-white">
                            {{ s.name }}
                          </h4>
                          <p class="text-[11px] sm:text-xs leading-relaxed text-zinc-400 line-clamp-2">
                            {{ s.description }}
                          </p>
                        </div>

                        <div class="pt-2 flex items-center justify-between text-[10.5px] sm:text-[11px] border-t border-zinc-800/80 text-zinc-400">
                          <span>Desde {{ s.startingPriceCop | currencyCop }}</span>
                          <span class="text-amber-400 font-semibold">Seleccionar</span>
                        </div>
                      </button>
                    }
                  </div>
                </div>

                <!-- Sub-sección Especialista -->
                <div>
                  <div class="flex items-center justify-between mb-2.5 sm:mb-3">
                    <div>
                      <label class="text-xs font-bold uppercase tracking-wider text-amber-400 block">2. Selecciona el Especialista</label>
                      <p class="text-xs text-zinc-400 mt-0.5">Elige profesional de preferencia o primer turno disponible</p>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                    <button
                      type="button"
                      (click)="bookingForm.specialistId = 'any'"
                      class="p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center gap-3 group"
                      [ngClass]="bookingForm.specialistId === 'any' ? 'bg-zinc-950 text-white border-amber-400 ring-1 ring-amber-400/30' : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-200'"
                    >
                      <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-colors"
                           [ngClass]="bookingForm.specialistId === 'any' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-zinc-300'">
                        ✦
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="text-xs sm:text-sm font-bold truncate">Cualquiera</p>
                        <p class="text-[10.5px] text-zinc-400 truncate mt-0.5">
                          Primer turno disponible
                        </p>
                      </div>
                    </button>

                    @for (doc of specialists; track doc.id) {
                      <button
                        type="button"
                        (click)="bookingForm.specialistId = doc.id"
                        class="p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center gap-3 group"
                        [ngClass]="bookingForm.specialistId === doc.id ? 'bg-zinc-950 text-white border-amber-400 ring-1 ring-amber-400/30' : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-200'"
                      >
                        <img
                          [src]="doc.photoUrl"
                          [alt]="doc.name"
                          class="w-10 h-10 rounded-xl object-cover border border-zinc-700"
                        />
                        <div class="min-w-0 flex-1">
                          <p class="text-xs sm:text-sm font-bold truncate">{{ doc.name }}</p>
                          <p class="text-[10.5px] text-zinc-400 truncate mt-0.5">
                            {{ doc.role }}
                          </p>
                        </div>
                      </button>
                    }
                  </div>
                </div>

                <div class="pt-4 sm:pt-5 flex justify-end border-t border-zinc-800">
                  <button
                    type="button"
                    (click)="nextStep()"
                    [disabled]="!bookingForm.serviceId"
                    class="w-full sm:w-auto rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs sm:text-sm font-semibold px-7 py-3 transition-colors cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <span>Continuar al Calendario</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            }

            <!-- ─── PASO 2: SELECCIÓN DE DÍA ─── -->
            @if (currentStep() === 2) {
              <div class="space-y-4 sm:space-y-5 animate-fade-in">
                <div class="flex items-center justify-between px-1">
                  <div>
                    <span class="text-xs sm:text-sm font-black text-white">Septiembre 2026</span>
                    <p class="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Lunes a Sábado de 8:00 a.m. a 4:00 p.m.</p>
                  </div>
                  <span class="text-[10.5px] sm:text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 sm:px-3 py-1 rounded-full">
                    Sede Mantra Medellín
                  </span>
                </div>

                <div class="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[11px] sm:text-xs">
                  <span class="font-bold text-zinc-500 py-1">Lun</span>
                  <span class="font-bold text-zinc-500 py-1">Mar</span>
                  <span class="font-bold text-zinc-500 py-1">Mié</span>
                  <span class="font-bold text-zinc-500 py-1">Jue</span>
                  <span class="font-bold text-zinc-500 py-1">Vie</span>
                  <span class="font-bold text-zinc-500 py-1">Sáb</span>
                  <span class="font-bold text-zinc-600 py-1">Dom</span>

                  @for (day of calendarDays; track day.date) {
                    <button
                      type="button"
                      (click)="day.isSelectable ? selectDate(day.date) : null"
                      [disabled]="!day.isSelectable"
                      class="h-11 sm:h-16 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all border relative"
                      [ngClass]="{
                        'bg-zinc-950/40 border-zinc-800/40 cursor-not-allowed select-none': !day.isSelectable,
                        'bg-amber-400 text-zinc-950 border-amber-400 font-black shadow-lg scale-105 cursor-pointer': day.isSelectable && bookingForm.date === day.date,
                        'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-amber-400/50 cursor-pointer': day.isSelectable && bookingForm.date !== day.date
                      }"
                    >
                      <span 
                        class="text-xs sm:text-base font-bold"
                        [ngClass]="{
                          'text-zinc-500 line-through decoration-zinc-600': !day.isSelectable,
                          'text-zinc-950 font-black': day.isSelectable && bookingForm.date === day.date,
                          'text-zinc-200': day.isSelectable && bookingForm.date !== day.date
                        }"
                      >
                        {{ day.dayNumber }}
                      </span>
                      @if (day.isSelectable) {
                        <span class="text-[8.5px] sm:text-[9.5px] mt-0.5 opacity-80">Disp.</span>
                      }
                    </button>
                  }
                </div>

                <div class="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    (click)="prevStep()"
                    class="rounded-full border border-zinc-800 text-zinc-400 text-xs font-semibold px-5 py-2.5 hover:bg-zinc-800 cursor-pointer"
                  >
                    ← Volver
                  </button>
                  <button
                    type="button"
                    (click)="nextStep()"
                    [disabled]="!bookingForm.date"
                    class="rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs sm:text-sm font-semibold px-6 py-2.5 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Seleccionar Horario →
                  </button>
                </div>
              </div>
            }

            <!-- ─── PASO 3: SELECCIÓN DE HORA ─── -->
            @if (currentStep() === 3) {
              <div class="space-y-5 animate-fade-in">
                <div>
                  <label class="text-xs font-bold uppercase tracking-wider text-amber-400 block">Horarios Disponibles</label>
                  <p class="text-xs text-zinc-400 mt-0.5">Fecha seleccionada: <strong class="text-white">{{ bookingForm.date }}</strong></p>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  @for (slot of availableSlots(); track slot.time) {
                    <button
                      type="button"
                      (click)="slot.isAvailable ? bookingForm.timeSlot = slot.time : null"
                      [disabled]="!slot.isAvailable"
                      class="p-4 rounded-2xl border text-center transition-all"
                      [ngClass]="{
                        'bg-zinc-950/50 border-zinc-800/80 cursor-not-allowed select-none': !slot.isAvailable,
                        'bg-amber-400 text-zinc-950 border-amber-400 font-black shadow-lg scale-[1.02] ring-1 ring-amber-400/40 cursor-pointer': slot.isAvailable && bookingForm.timeSlot === slot.time,
                        'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-amber-400/60 hover:bg-zinc-850 cursor-pointer': slot.isAvailable && bookingForm.timeSlot !== slot.time
                      }"
                    >
                      <span
                        class="text-base block font-bold"
                        [ngClass]="{
                          'text-zinc-500 line-through decoration-zinc-600': !slot.isAvailable,
                          'text-zinc-950 font-black': slot.isAvailable && bookingForm.timeSlot === slot.time,
                          'text-white': slot.isAvailable && bookingForm.timeSlot !== slot.time
                        }"
                      >
                        {{ slot.time }} hrs
                      </span>
                      
                      @if (!slot.isAvailable) {
                        <span class="text-[11px] mt-1 block font-semibold text-zinc-400">
                          Ocupado
                        </span>
                      } @else if (bookingForm.timeSlot === slot.time) {
                        <span class="text-[11px] mt-1 block font-bold text-zinc-900">
                          ✓ Seleccionado
                        </span>
                      } @else {
                        <span class="text-[11px] mt-1 block font-medium text-emerald-400/90">
                          Disponible
                        </span>
                      }
                    </button>
                  }
                </div>

                <div class="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    (click)="prevStep()"
                    class="rounded-full border border-zinc-800 text-zinc-400 text-xs font-semibold px-5 py-2.5 hover:bg-zinc-800 cursor-pointer"
                  >
                    ← Volver
                  </button>
                  <button
                    type="button"
                    (click)="nextStep()"
                    [disabled]="!bookingForm.timeSlot"
                    class="rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs sm:text-sm font-semibold px-6 py-2.5 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Datos de Contacto →
                  </button>
                </div>
              </div>
            }

            <!-- ─── PASO 4: DATOS DE CONTACTO ─── -->
            @if (currentStep() === 4) {
              <form (ngSubmit)="nextStep()" class="space-y-5 animate-fade-in">
                <div class="space-y-4">
                  <div>
                    <label class="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      [(ngModel)]="bookingForm.patientName"
                      name="patientName"
                      required
                      class="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                      placeholder="Ej: Carolina Restrepo"
                    />
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">WhatsApp / Teléfono *</label>
                      <input
                        type="tel"
                        [(ngModel)]="bookingForm.patientPhone"
                        name="patientPhone"
                        required
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                        placeholder="Ej: 310 123 4567"
                      />
                    </div>

                    <div>
                      <label class="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">Correo Electrónico</label>
                      <input
                        type="email"
                        [(ngModel)]="bookingForm.patientEmail"
                        name="patientEmail"
                        class="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                        placeholder="Ej: carolina@gmail.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">Observaciones o Notas</label>
                    <textarea
                      [(ngModel)]="bookingForm.notes"
                      name="notes"
                      rows="2"
                      class="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                      placeholder="¿Algún antecedente, zona de interés o tratamiento previo?"
                    ></textarea>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    (click)="prevStep()"
                    class="rounded-full border border-zinc-800 text-zinc-400 text-xs font-semibold px-5 py-2.5 hover:bg-zinc-800 cursor-pointer"
                  >
                    ← Volver
                  </button>
                  <button
                    type="submit"
                    [disabled]="!bookingForm.patientName.trim() || !bookingForm.patientPhone.trim()"
                    class="rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs sm:text-sm font-semibold px-6 py-2.5 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Revisar Resumen →
                  </button>
                </div>
              </form>
            }

            <!-- ─── PASO 5: CONFIRMACIÓN ─── -->
            @if (currentStep() === 5) {
              <div class="space-y-5 animate-fade-in">
                @if (!confirmedAppointment()) {
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    <div class="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
                      <span class="text-[10px] uppercase tracking-wider font-bold text-amber-400 block">Detalles de la Cita</span>
                      
                      <div class="flex justify-between pb-2 border-b border-zinc-800">
                        <span class="text-zinc-400">Tratamiento:</span>
                        <strong class="text-white text-right">{{ selectedServiceName() }}</strong>
                      </div>
                      <div class="flex justify-between pb-2 border-b border-zinc-800">
                        <span class="text-zinc-400">Especialista:</span>
                        <strong class="text-white">{{ selectedSpecialistName() }}</strong>
                      </div>
                      <div class="flex justify-between pb-2 border-b border-zinc-800">
                        <span class="text-zinc-400">Fecha:</span>
                        <strong class="text-white">{{ bookingForm.date }}</strong>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-zinc-400">Horario:</span>
                        <strong class="text-white">{{ bookingForm.timeSlot }} hrs</strong>
                      </div>
                    </div>

                    <div class="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between space-y-3 text-xs">
                      <div class="space-y-1.5">
                        <span class="text-[10px] uppercase tracking-wider font-bold text-amber-400 block">Datos del Paciente</span>
                        <p class="font-bold text-sm text-white">{{ bookingForm.patientName }}</p>
                        <p class="text-zinc-400">WhatsApp: {{ bookingForm.patientPhone }}</p>
                        @if (bookingForm.patientEmail) {
                          <p class="text-zinc-500">Email: {{ bookingForm.patientEmail }}</p>
                        }
                      </div>

                      <div class="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
                        ✦ El equipo de Mantra Group se comunicará contigo vía WhatsApp para confirmar tu valoración.
                      </div>
                    </div>

                  </div>

                  <div class="flex items-center justify-between pt-3 border-t border-zinc-800">
                    <button
                      type="button"
                      (click)="prevStep()"
                      class="rounded-full border border-zinc-800 text-zinc-400 text-xs font-semibold px-5 py-2.5 hover:bg-zinc-800 cursor-pointer"
                    >
                      ← Modificar
                    </button>
                    <button
                      type="button"
                      (click)="submitBooking()"
                      class="rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs sm:text-sm font-semibold px-7 py-3 transition-colors cursor-pointer active:scale-[0.98]"
                    >
                      Confirmar Cita Ahora
                    </button>
                  </div>
                } @else {
                  <!-- Éxito -->
                  <div class="text-center py-8 space-y-4">
                    <div class="w-16 h-16 bg-amber-500/15 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/30">
                      <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>

                    <h4 class="text-2xl font-black text-white">¡Cita Registrada en Mantra Group!</h4>
                    <p class="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                      Reserva: <strong class="text-amber-400">{{ confirmedAppointment()?.id }}</strong>.<br />
                      Te esperamos el <strong>{{ confirmedAppointment()?.date }}</strong> a las <strong>{{ confirmedAppointment()?.timeSlot }} hrs</strong>.
                    </p>

                    <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        type="button"
                        (click)="downloadIcs()"
                        class="rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs sm:text-sm font-semibold px-5 py-2.5 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <svg class="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                        </svg>
                        Descargar Recordatorio (.ICS)
                      </button>

                      <button
                        type="button"
                        (click)="closeBookingModal()"
                        class="rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs sm:text-sm font-semibold px-6 py-2.5 transition-colors cursor-pointer"
                      >
                        Finalizar
                      </button>
                    </div>
                  </div>
                }
              </div>
            }

          </div>
        </div>
      }

    </div>
  `,
})
export class LandingComponent implements OnInit, AfterViewInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly router = inject(Router);

  readonly services = computed(() => this.appointmentService.services);
  readonly specialists = this.appointmentService.specialists;

  // ─── Los 7 Procedimientos Estéticos Oficiales de Mantra Group ───
  readonly bookingServices: PublicService[] = this.appointmentService.services;

  readonly isMobileMenuOpen = signal(false);
  readonly showBookingModal = signal(false);
  readonly currentStep = signal<number>(1);
  readonly confirmedAppointment = signal<Appointment | null>(null);

  // ─── Carrusel Editorial con los 7 Procedimientos e Imágenes HD ─
  readonly carouselSlides = [
    {
      id: 'srv-001',
      title: 'Rinomodelación',
      shortTitle: 'Rinomodelación',
      category: 'Medicina Facial',
      duration: '45 min',
      image: '/images/mantra_rinomodelacion.jpg',
      tagline: 'Armonización nasal de alta precisión con ácido hialurónico biocompatible sin cirugía.',
    },
    {
      id: 'srv-002',
      title: 'Labios (Perfilado & Relleno)',
      shortTitle: 'Labios',
      category: 'Medicina Facial',
      duration: '45 min',
      image: '/images/mantra_labios.jpg',
      tagline: 'Perfilado labial, volumen sutil e hidratación dérmica profunda con ácido reticulado.',
    },
    {
      id: 'srv-003',
      title: 'Botox (Toxina Botulínica)',
      shortTitle: 'Botox',
      category: 'Medicina Facial',
      duration: '40 min',
      image: '/images/mantra_botox.jpg',
      tagline: 'Atenuación armónica de líneas dinámicas en frente, entrecejo y patas de gallo.',
    },
    {
      id: 'srv-004',
      title: 'Depilación Láser Médica',
      shortTitle: 'Depilación Láser',
      category: 'Aparatología Láser',
      duration: '45 min',
      image: '/images/mantra_depilacion.jpg',
      tagline: 'Tecnología diodo de alta potencia con cabezal frío para depilación definitiva indolora.',
    },
    {
      id: 'srv-005',
      title: 'Limpieza Facial Profunda + Glow',
      shortTitle: 'Limpieza Facial',
      category: 'Cosmetología Facial',
      duration: '60 min',
      image: '/images/mantra_limpieza.jpg',
      tagline: 'Higiene dérmica estéril, microdermoabrasión diamante, extracción y velo nutritivo.',
    },
    {
      id: 'srv-006',
      title: 'Cierre de Costillas & Remodelación',
      shortTitle: 'Cierre de Costillas',
      category: 'Moldeamiento Corporal',
      duration: '60 min',
      image: '/images/mantra_cierre_costillas.jpg',
      tagline: 'Terapia no invasiva de reducción del arco costal y estilización armónica de cintura.',
    },
    {
      id: 'srv-007',
      title: 'Glúteos (Armonización & Firmeza)',
      shortTitle: 'Glúteos',
      category: 'Moldeamiento Corporal',
      duration: '60 min',
      image: '/images/mantra_gluteos.jpg',
      tagline: 'Bioestimulación de colágeno, proyección natural y tonificación de contorno glúteo.',
    },
  ];

  readonly currentSlide = signal<number>(0);
  private autoPlayTimer: any = null;

  ngOnInit(): void {
    if (typeof window !== 'undefined' && (window as any).AOS) {
      (window as any).AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 60,
      });
    }
    this.startAutoPlay();
  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && (window as any).AOS) {
      setTimeout(() => (window as any).AOS.refresh(), 200);
    }
  }

  startAutoPlay(): void {
    if (typeof window !== 'undefined') {
      this.autoPlayTimer = setInterval(() => {
        this.nextSlide();
      }, 6000);
    }
  }

  nextSlide(): void {
    this.currentSlide.update(c => (c + 1) % this.carouselSlides.length);
  }

  prevSlide(): void {
    this.currentSlide.update(c => (c - 1 + this.carouselSlides.length) % this.carouselSlides.length);
  }

  setSlide(index: number): void {
    this.currentSlide.set(index);
  }

  openBookingWithServiceId(serviceId: string): void {
    const s = this.appointmentService.getServiceById(serviceId);
    if (s) {
      this.openBookingWithService(s);
    } else {
      this.bookingForm.serviceId = serviceId;
      this.openBookingModal();
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  bookingForm = {
    serviceId: 'srv-001',
    specialistId: 'any',
    date: '2026-09-12',
    timeSlot: '',
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    notes: '',
  };

  readonly calendarDays = [
    { date: '2026-09-07', dayNumber: 7, isSelectable: false },
    { date: '2026-09-08', dayNumber: 8, isSelectable: false },
    { date: '2026-09-09', dayNumber: 9, isSelectable: false },
    { date: '2026-09-10', dayNumber: 10, isSelectable: true },
    { date: '2026-09-11', dayNumber: 11, isSelectable: true },
    { date: '2026-09-12', dayNumber: 12, isSelectable: true },
    { date: '2026-09-13', dayNumber: 13, isSelectable: false },
    { date: '2026-09-14', dayNumber: 14, isSelectable: true },
    { date: '2026-09-15', dayNumber: 15, isSelectable: true },
    { date: '2026-09-16', dayNumber: 16, isSelectable: true },
    { date: '2026-09-17', dayNumber: 17, isSelectable: true },
    { date: '2026-09-18', dayNumber: 18, isSelectable: true },
    { date: '2026-09-19', dayNumber: 19, isSelectable: true },
    { date: '2026-09-20', dayNumber: 20, isSelectable: false },
    { date: '2026-09-21', dayNumber: 21, isSelectable: true },
    { date: '2026-09-22', dayNumber: 22, isSelectable: true },
    { date: '2026-09-23', dayNumber: 23, isSelectable: true },
    { date: '2026-09-24', dayNumber: 24, isSelectable: true },
    { date: '2026-09-25', dayNumber: 25, isSelectable: true },
    { date: '2026-09-26', dayNumber: 26, isSelectable: true },
    { date: '2026-09-27', dayNumber: 27, isSelectable: false },
  ];

  readonly availableSlots = computed(() => {
    return this.appointmentService.getAvailabilitySlots(
      this.bookingForm.date,
      this.bookingForm.specialistId
    );
  });

  openBookingModal(): void {
    this.currentStep.set(1);
    this.confirmedAppointment.set(null);
    this.bookingForm.timeSlot = '';
    this.showBookingModal.set(true);
  }

  openBookingWithService(service: PublicService): void {
    this.bookingForm.serviceId = service.id;
    this.bookingForm.specialistId = service.recommendedSpecialistId || 'any';
    this.openBookingModal();
  }

  openBookingWithSpecialist(specialistId: string): void {
    this.bookingForm.specialistId = specialistId;
    this.openBookingModal();
  }

  closeBookingModal(): void {
    this.showBookingModal.set(false);
    this.confirmedAppointment.set(null);
  }

  selectDate(date: string): void {
    this.bookingForm.date = date;
    this.bookingForm.timeSlot = '';
  }

  nextStep(): void {
    if (this.currentStep() < 5) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  getStepTitle(step: number): string {
    switch (step) {
      case 1: return 'Selección de Tratamiento y Especialista';
      case 2: return 'Selecciona el Día de tu Cita';
      case 3: return 'Selecciona el Horario Disponible (8am – 4pm)';
      case 4: return 'Tus Datos de Contacto';
      case 5: return 'Confirmación de la Cita';
      default: return 'Agendamiento de Cita';
    }
  }

  selectedServiceName(): string {
    const s = this.appointmentService.getServiceById(this.bookingForm.serviceId);
    return s ? s.name : 'Servicio Especializado';
  }

  selectedSpecialistName(): string {
    if (this.bookingForm.specialistId === 'any') return 'Primer especialista disponible';
    const spec = this.specialists.find(s => s.id === this.bookingForm.specialistId);
    return spec ? spec.name : 'Especialista Asignado';
  }

  submitBooking(): void {
    const apt = this.appointmentService.createAppointment({
      patientName: this.bookingForm.patientName,
      patientPhone: this.bookingForm.patientPhone,
      patientEmail: this.bookingForm.patientEmail,
      serviceId: this.bookingForm.serviceId,
      specialistId: this.bookingForm.specialistId === 'any' ? undefined : this.bookingForm.specialistId,
      date: this.bookingForm.date,
      timeSlot: this.bookingForm.timeSlot,
      notes: this.bookingForm.notes,
      createdBy: 'CLIENT_SELF',
    });

    this.confirmedAppointment.set(apt);
  }

  downloadIcs(): void {
    const apt = this.confirmedAppointment();
    if (!apt) return;

    const dateFormatted = apt.date.replace(/-/g, '');
    const startTime = apt.timeSlot.replace(':', '') + '00';
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Mantra Group//Citas//ES',
      'BEGIN:VEVENT',
      `UID:${apt.id}@mantragroup.com`,
      `DTSTAMP:${dateFormatted}T${startTime}Z`,
      `DTSTART:${dateFormatted}T${startTime}`,
      `SUMMARY:Cita Mantra Group - ${apt.serviceName}`,
      `DESCRIPTION:Especialista: ${apt.specialistName || 'Asignado'}. Paciente: ${apt.patientName}.`,
      'LOCATION:Mantra Group - Centro Estético Corporal y Facial',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Cita_Mantra_${apt.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
