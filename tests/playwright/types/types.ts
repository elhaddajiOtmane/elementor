export type Image = {
    title: string,
    description?: string,
    alt_text?: string,
    caption?: string,
    extension: string,
    filePath?: string
}

export type StorageState = {
    cookies: Array<{
        name: string;
        value: string;
        domain: string;
        path: string;
        expires: number;
        httpOnly: boolean;
        secure: boolean;
        sameSite: 'Strict' | 'Lax' | 'None';
    }>;
    origins: Array<{
        origin: string;
        localStorage: Array<{
            name: string;
            value: string;
        }>;
    }>;
};
export type VideoParams = {
        'autoplay': string,
        'endscreen-enable': string,
        'mute': string,
        'start': string,
        'playsinline': string,
        'controls': string,
        'ui-start-screen-info': string,
        'ui-logo': string
}

export type LinkOptions = {
    targetBlank?: boolean,
    noFollow?: boolean,
    customAttributes?: {key:string, value: string },
    linkTo?: boolean,
    linkInpSelector?: string
}

export type WpPage = {
	title: string | {
		rendered: string,
	},
	date?: string,
	date_gmt?: string,
	guid?: string,
	id?: string,
	link?: string,
	modified?: string,
	modified_gmt?: string,
	slug: string,
	status?: 'publish' | 'future' | 'draft' | 'pending' | 'private',
	type?: string,
	password?: string,
	permalink_template?: string,
	generated_slug?: string,
	parent?: string,
	content: string,
	author?: string,
	excerpt?: string,
	featured_media?: string,
	comment_status?: string,
	ping_status?: string,
	menu_order?: string,
	meta?: string,
	template?: string,
}

export type Post = {
	id?: string,
	date?: string,
	date_gmt?: string,
	slug?: string,
	status?: 'publish' | 'future' | 'draft' | 'pending' | 'private',
	password?: string,
	title?: string,
	content?: string,
	author?: number,
	excerpt?: string,
	featured_media?: number,
	comment_status?: 'open' | 'closed',
	ping_status?: 'open' | 'closed',
	format?: 'standard' | 'aside' | 'chat' | 'gallery' | 'link' | 'image' | 'quote' | 'status' | 'video' | 'audio',
	meta?: string,
	sticky?: boolean,
	template?: string,
	tags?: number
}
