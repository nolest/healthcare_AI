import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { TransformStreamDefaultController } from 'node:stream/web';
import { PostModel } from './post.model';

class CreatePostDto {
    @ApiProperty({ description: 'post title'})
    title: string
    @ApiProperty({ description: 'post content'})
    content: string
}

// class UpdatePostDto {
//     @ApiProperty({ description: 'post title'})
//     title: string
//     @ApiProperty({ description: 'post content'})
//     content: string
// }

@Controller('posts')
@ApiTags('posts')
export class PostsController {
    @Get()
    @ApiOperation({ summary: 'show blog list'})
    async index(){
        return await PostModel.find()
    }

    @Post()
    @ApiOperation({ summary: 'create a post'})
    async create(@Body() createPostDto: CreatePostDto) {
        await PostModel.create(createPostDto)
        return {
            success: true
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'post detail'})
    detail(@Param('id') id: string){
        return {
            id: id,
            title: 'aaaa'
        }
    }

    @Put(':id')
    @ApiOperation({ summary: 'edit post'})
    update(@Param('id') id: string, @Body() body: CreatePostDto){
        return {
            success: true
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'delete post'})
    remove(@Param('id') id: string) {
        return {
            success: true
        }
    }
}
