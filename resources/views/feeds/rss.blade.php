{!! '<'.'?xml version="1.0" encoding="UTF-8"?'.'>' !!}
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>{{ $title }}</title>
        <link>{{ $link }}</link>
        <description>{{ $description }}</description>
        <language>id</language>
        <atom:link href="{{ $selfUrl }}" rel="self" type="application/rss+xml" />
@foreach ($articles as $article)
        <item>
            <title>{{ $article->title }}</title>
            <link>{{ $article->url() }}</link>
            <guid isPermaLink="true">{{ $article->url() }}</guid>
            <description>{{ $article->excerpt }}</description>
            <category>{{ $article->category->name }}</category>
            <pubDate>{{ $article->published_at?->toRssString() }}</pubDate>
        </item>
@endforeach
    </channel>
</rss>
