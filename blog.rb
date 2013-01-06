require 'bundler'
Bundler.require

class Blog < Sinatra::Base
  get '/' do
    @string = "Is my conference gender blind?"

    haml :index
  end

  get '/results' do
    @total = params[:t].to_i
    @num_women = params[:w].to_i
    @percent_women = params[:p].to_f
    @percent_women /= 100.0

    def fact(n)
      return n < 2 ? 1 : n * fact(n - 1)
    end

    @probs = []

    (@total + 1).times do |i|
      num_women = i
      num_men = @total - i

      # how many ways can this outcome occur?
      num_outcomes = fact(@total) / (fact(num_women) * fact(num_men))

      # what is the probability of this outcome occuring once?
      prob = (1 - @percent_women)**(num_men) * (@percent_women)**(num_women)

      # what is the total probability of the distribution?
      total_prob = prob * num_outcomes
      simple_percent = (total_prob * 1000).floor.to_f / 10
      @probs << simple_percent
    end

    rolling = 100

    @rolls = []

    @probs.each_with_index do |p,i|
      simple_percent = (rolling * 10).floor.to_f / 10
      rolling = rolling - p
      @rolls << simple_percent unless i == 0
    end

    haml :results
  end
end
