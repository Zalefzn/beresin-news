<x-mail::message>
# Pesan Baru dari Formulir Kontak

**Nama:** {{ $senderName }}<br>
**Email:** {{ $senderEmail }}<br>
**Subjek:** {{ $topic }}

{{ $messageBody }}
</x-mail::message>
