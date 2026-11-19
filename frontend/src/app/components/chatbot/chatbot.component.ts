import { Component, OnInit, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { MensajeChat } from '../../models/chat.model';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  private chatService = inject(ChatService);

  @ViewChild('mensajesContainer') private mensajesContainer!: ElementRef;

  // Estado de visibilidad de la ventana del chat
  abierto: boolean = false;

  // Mensaje actual en el input
  mensajeInput: string = '';

  // Estado de carga mientras Gemini responde
  cargando: boolean = false;

  // Historial de la conversación
  mensajes: MensajeChat[] = [];

  // Preguntas sugeridas para probar con un clic
  sugerencias: string[] = [
    '¿Qué libros tienen de Borges?',
    '¿Tienen disponible "El Principito"?',
    '¿Qué autores hay registrados?'
  ];

  ngOnInit(): void {
    // Mensaje de bienvenida inicial
    this.mensajes.push({
      remitente: 'bot',
      texto: '¡Hola! 👋 Soy el asistente virtual de la biblioteca. Podés preguntarme qué libros o autores tenemos, si están disponibles o qué te gustaría leer.',
      hora: this.obtenerHoraActual()
    });
  }

  ngAfterViewChecked(): void {
    this.hacerScrollAbajo();
  }

  // Alterna entre abrir y cerrar el chat
  toggleChat(): void {
    this.abierto = !this.abierto;
  }

  // Envía una sugerencia rápida
  usarSugerencia(texto: string): void {
    this.mensajeInput = texto;
    this.enviar();
  }

  // Envía el mensaje a Flask
  enviar(): void {
    const texto = this.mensajeInput.trim();
    if (!texto || this.cargando) return;

    // Agregamos el mensaje del usuario a la pantalla
    this.mensajes.push({
      remitente: 'usuario',
      texto: texto,
      hora: this.obtenerHoraActual()
    });

    this.mensajeInput = '';
    this.cargando = true;

    // Llamamos al servicio
    this.chatService.enviarMensaje(texto).subscribe({
      next: (resp) => {
        this.mensajes.push({
          remitente: 'bot',
          texto: resp.respuesta,
          hora: this.obtenerHoraActual()
        });
        this.cargando = false;
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'No pude conectarme con el servidor. Verificá que Flask esté corriendo con GEMINI_API_KEY configurada.';
        this.mensajes.push({
          remitente: 'bot',
          texto: `⚠️ ${errorMsg}`,
          hora: this.obtenerHoraActual(),
          esError: true
        });
        this.cargando = false;
        console.error(err);
      }
    });
  }

  private obtenerHoraActual(): string {
    const ahora = new Date();
    return ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private hacerScrollAbajo(): void {
    try {
      if (this.mensajesContainer) {
        this.mensajesContainer.nativeElement.scrollTop = this.mensajesContainer.nativeElement.scrollHeight;
      }
    } catch (e) {
      // Ignorar si el elemento aún no está en el DOM
    }
  }
}
