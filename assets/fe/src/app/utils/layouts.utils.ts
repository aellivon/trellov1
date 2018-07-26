export function ContentOnly(content){
	return {
		content: content
	}
}

export function ContentAndHeader(header, content){
    return {
        content: content,
        header: header
    }
}