import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@Request() req: any, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(req.user.id, createPostDto);
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.postsService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.postsService.findById(id, req.user.id);
  }

  @Put(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, req.user.id, updatePostDto);
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.postsService.delete(id, req.user.id);
  }

  @Post(':id/approve')
  async approve(@Request() req: any, @Param('id') id: string) {
    return this.postsService.approve(id, req.user.id);
  }

  @Post(':id/publish')
  async publish(@Request() req: any, @Param('id') id: string) {
    return this.postsService.publish(id, req.user.id);
  }

  @Post(':id/duplicate')
  async duplicate(@Request() req: any, @Param('id') id: string) {
    return this.postsService.duplicate(id, req.user.id);
  }
}
