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

export function ContentSubheaderAndHeader(header, sub_header, content){
    return {
        content: content,
        sub_header: sub_header,
        header: header
    }
}


export function ContentSubheaderSideBarAndHeader(header, sub_header, content, side_bar){
    return {
        content: content,
        sub_header: sub_header,
        header: header,
        side_bar: side_bar
    }
}